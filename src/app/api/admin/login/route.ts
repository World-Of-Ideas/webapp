import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getEnv } from "@/db";
import { apiSuccess, apiError, getClientIp } from "@/lib/api";
import { createSession, cleanupExpiredSessions, verifyPassword } from "@/lib/admin";
import { cleanupErrorLog } from "@/lib/error-tracking";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";

export async function POST(request: NextRequest) {
	try {
		const ip = getClientIp(request);
		const rateLimitKey = `login:${ip}`;
		if (!checkRateLimit(rateLimitKey, 5, 60 * 60 * 1000)) {
			return apiError("RATE_LIMITED", "Too many login attempts. Try again later.");
		}

		let body;
		try { body = await request.json(); } catch { return apiError("VALIDATION_ERROR", "Invalid JSON"); }
		const { password, turnstileToken } = body as { password?: string; turnstileToken?: string };

		if (!password || typeof password !== "string" || password.length > 1000) {
			return apiError("VALIDATION_ERROR", "Invalid credentials");
		}

		if (!turnstileToken || typeof turnstileToken !== "string") {
			return apiError("VALIDATION_ERROR", "Verification required");
		}

		const env = await getEnv();

		const turnstileValid = await verifyTurnstileToken(turnstileToken, env.TURNSTILE_SECRET_KEY);
		if (!turnstileValid) {
			return apiError("TURNSTILE_FAILED", "Verification failed. Please try again.");
		}

		const adminPw = env.ADMIN_PASSWORD;
		if (!adminPw || typeof adminPw !== "string") {
			return apiError("INTERNAL_ERROR", "Server configuration error");
		}

		// Cleanup expired sessions and old error logs on each login attempt
		await Promise.all([
			cleanupExpiredSessions(),
			cleanupErrorLog(30),
		]);

		const isValid = await verifyPassword(password, adminPw);
		if (!isValid) {
			return apiError("UNAUTHORIZED", "Invalid password");
		}

		const sessionId = await createSession();

		const cookieStore = await cookies();
		cookieStore.set("admin_session", sessionId, {
			httpOnly: true,
			secure: process.env.NODE_ENV !== "development",
			sameSite: "lax",
			path: "/",
			maxAge: 60 * 60 * 24, // 24 hours
		});

		return apiSuccess({ success: true });
	} catch {
		return apiError("INTERNAL_ERROR", "An unexpected error occurred");
	}
}
