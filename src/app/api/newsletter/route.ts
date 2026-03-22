import { NextRequest } from "next/server";
import { getEnv } from "@/db";
import { apiSuccess, apiError, getClientIp } from "@/lib/api";
import { getSiteSettingsDirect } from "@/lib/site-settings";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { generateReferralCode } from "@/lib/referral";
import { createSubscriber, getSubscriberByEmail } from "@/lib/subscribers";
import { enqueueEmail } from "@/lib/queue";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendMetaConversionEvent, sendGaConversionEvent } from "@/lib/tracking";
import { isValidEmail, safeParseJson, validateLength } from "@/lib/validation";
import { fireWebhooks } from "@/lib/webhooks";

export async function POST(request: NextRequest) {
	const settings = await getSiteSettingsDirect();
	if (!settings.features.newsletter) {
		return apiError("NOT_FOUND", "Resource not found");
	}

	const ip = getClientIp(request);
	if (!checkRateLimit(`newsletter:${ip}`, 5, 60 * 1000)) {
		return apiError("RATE_LIMITED", "Too many requests. Please try again later.");
	}

	const body = await safeParseJson(request);
	if (!body || typeof body !== "object") {
		return apiError("VALIDATION_ERROR", "Invalid JSON");
	}

	try {
		const { email, name, turnstileToken, source } = body as {
			email?: string;
			name?: string;
			turnstileToken?: string;
			source?: string;
		};

		if (!email || !name) {
			return apiError("VALIDATION_ERROR", "Email and name are required");
		}

		if (!isValidEmail(email)) {
			return apiError("VALIDATION_ERROR", "Invalid email format");
		}

		const lengthErr =
			validateLength(name, "Name", 100) ??
			validateLength(source, "Source", 255);
		if (lengthErr) {
			return apiError("VALIDATION_ERROR", lengthErr);
		}

		if (!turnstileToken) {
			return apiError("VALIDATION_ERROR", "Turnstile token is required");
		}

		const env = await getEnv();
		const isValid = await verifyTurnstileToken(turnstileToken, env.TURNSTILE_SECRET_KEY);
		if (!isValid) {
			return apiError("TURNSTILE_FAILED", "Turnstile verification failed");
		}

		const isDoubleOptIn = !!settings.features.doubleOptIn;

		// Check for existing subscriber
		const existing = await getSubscriberByEmail(email);
		if (existing) {
			if (isDoubleOptIn && existing.status === "pending") {
				try {
					await enqueueEmail(env.EMAIL_QUEUE, {
						type: "email_verification",
						payload: { email, name: existing.name },
					});
				} catch {
					// Queue may not be available in local dev
				}
				return apiSuccess({ existing: true });
			}
			return apiSuccess({ existing: true });
		}

		// Retry loop handles both email duplicate (concurrent) and referral code collision
		let subscriber;
		for (let attempt = 0; attempt < 3; attempt++) {
			const referralCode = generateReferralCode();
			try {
				const status = isDoubleOptIn ? "pending" : undefined;
				subscriber = await createSubscriber({
					email,
					name,
					referralCode,
					source,
					status,
				});
				break;
			} catch (err) {
				if (err instanceof Error && err.message.includes("UNIQUE constraint failed")) {
					const existingSub = await getSubscriberByEmail(email);
					if (existingSub) {
						return apiSuccess({ existing: true });
					}
					if (attempt === 2) throw err;
					continue;
				}
				throw err;
			}
		}
		if (!subscriber) throw new Error("Failed to create subscriber");

		// Queue confirmation or verification email
		try {
			if (isDoubleOptIn) {
				await enqueueEmail(env.EMAIL_QUEUE, {
					type: "email_verification",
					payload: { email, name },
				});
			} else {
				await enqueueEmail(env.EMAIL_QUEUE, {
					type: "newsletter_confirmation",
					payload: { email, name },
				});
			}
		} catch {
			// Queue may not be available in local dev
		}

		// Queue admin notification
		try {
			await enqueueEmail(env.EMAIL_QUEUE, {
				type: "newsletter_admin_notification",
				payload: { email, name, source: source ?? undefined },
			});
		} catch {
			// Queue may not be available in local dev
		}

		// Fire webhooks (fire-and-forget)
		fireWebhooks("newsletter.signup", {
			email,
			name,
			source: source ?? null,
		}).catch(() => {});

		const eventId = crypto.randomUUID();

		// Fire-and-forget CAPI Lead event
		sendMetaConversionEvent({
			eventName: "Lead",
			eventId,
			email,
			sourceUrl: request.url,
			ip,
			userAgent: request.headers.get("user-agent") ?? undefined,
		}).catch(() => {});

		// Fire-and-forget GA Measurement Protocol event
		sendGaConversionEvent({
			eventName: "generate_lead",
			email,
			sourceUrl: request.url,
		}).catch(() => {});

		return apiSuccess({ eventId }, 201);
	} catch {
		return apiError("INTERNAL_ERROR", "An unexpected error occurred");
	}
}
