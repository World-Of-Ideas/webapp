import { NextRequest } from "next/server";
import { getEnv } from "@/db";
import { siteConfig } from "@/config/site";
import { apiSuccess, apiError, getClientIp } from "@/lib/api";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { recordGiveawayAction, getGiveawayEntryByEmail, getGiveawayActions, isGiveawayEnded } from "@/lib/giveaway";
import { getPageBySlug } from "@/lib/pages";
import { checkRateLimit } from "@/lib/rate-limit";
import { isValidEmail, safeParseJson, validateLength } from "@/lib/validation";

const ALLOWED_ACTIONS = [
	"twitter_follow",
	"twitter_retweet",
	"discord_join",
	"instagram_follow",
	"newsletter_signup",
];

const REFERRAL_CODE_PATTERN = /^referral:[a-z0-9]{6,12}$/;

function isValidAction(action: string): boolean {
	if (REFERRAL_CODE_PATTERN.test(action)) return true;
	return ALLOWED_ACTIONS.includes(action);
}

export async function POST(request: NextRequest) {
	if (!siteConfig.features.giveaway) {
		return apiError("NOT_FOUND", "Resource not found");
	}

	const ip = getClientIp(request);
	if (!checkRateLimit(`giveaway-action:${ip}`, 10, 60 * 1000)) {
		return apiError("RATE_LIMITED", "Too many requests. Please try again later.");
	}

	const body = await safeParseJson(request);
	if (!body || typeof body !== "object") {
		return apiError("VALIDATION_ERROR", "Invalid JSON");
	}

	try {
		const { email, action, metadata, turnstileToken } = body as {
			email?: string;
			action?: string;
			metadata?: string;
			turnstileToken?: string;
		};

		if (!email || !action) {
			return apiError("VALIDATION_ERROR", "Email and action are required");
		}

		if (!isValidEmail(email)) {
			return apiError("VALIDATION_ERROR", "Invalid email format");
		}

		const lengthErr =
			validateLength(action, "Action", 100) ??
			validateLength(metadata, "Metadata", 500);
		if (lengthErr) {
			return apiError("VALIDATION_ERROR", lengthErr);
		}

		if (!turnstileToken) {
			return apiError("VALIDATION_ERROR", "Turnstile token is required");
		}

		if (!isValidAction(action)) {
			return apiError("VALIDATION_ERROR", "Unknown action type");
		}

		const env = await getEnv();
		const isValid = await verifyTurnstileToken(turnstileToken, env.TURNSTILE_SECRET_KEY);
		if (!isValid) {
			return apiError("TURNSTILE_FAILED", "Turnstile verification failed");
		}

		// Check end date
		const giveawayPage = await getPageBySlug("giveaway");
		const giveawayMeta = giveawayPage?.metadata as {
			endDate?: string;
			bonusEntries?: Record<string, number>;
		} | null;

		if (isGiveawayEnded(giveawayMeta?.endDate)) {
			return apiError("GIVEAWAY_ENDED", "The giveaway has ended");
		}

		const entry = await getGiveawayEntryByEmail(email);
		if (!entry) {
			return apiError("NOT_FOUND", "No giveaway entry found for this email");
		}

		// Check for duplicate action before inserting
		const existingActions = await getGiveawayActions(entry.id);
		if (existingActions.some((a) => a.action === action)) {
			return apiError("DUPLICATE_ACTION", "This action has already been completed");
		}

		// Determine bonus entries from giveaway page metadata
		// Look up by full action name first, then by stripped name for backwards compat
		const actionKey = action.startsWith("referral:") ? "referral" : action;
		const bonusEntries = giveawayMeta?.bonusEntries?.[actionKey] ?? giveawayMeta?.bonusEntries?.[action.replace("twitter_", "")] ?? 1;

		try {
			await recordGiveawayAction({
				entryId: entry.id,
				action,
				bonusEntries,
				metadata,
			});
		} catch (err) {
			// Catch unique constraint violation (duplicate action) from DB
			if (err instanceof Error && err.message.includes("UNIQUE constraint failed")) {
				return apiError("DUPLICATE_ACTION", "This action has already been completed");
			}
			throw err;
		}

		return apiSuccess({ success: true }, 201);
	} catch {
		return apiError("INTERNAL_ERROR", "An unexpected error occurred");
	}
}
