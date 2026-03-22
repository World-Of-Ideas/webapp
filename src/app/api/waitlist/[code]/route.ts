import { NextRequest } from "next/server";
import { apiSuccess, apiError, getClientIp } from "@/lib/api";
import { getSubscriberByReferralCode } from "@/lib/subscribers";
import { getPageBySlug } from "@/lib/pages";
import { calculateEffectivePosition } from "@/lib/referral";
import { getSiteSettingsDirect } from "@/lib/site-settings";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ code: string }> },
) {
	const { code } = await params;

	const ip = getClientIp(request);
	if (!checkRateLimit(`waitlist-code:${ip}`, 30, 60_000)) {
		return apiError("RATE_LIMITED", "Too many requests");
	}

	const settings = await getSiteSettingsDirect();
	if (!settings.features.waitlist) {
		return apiError("NOT_FOUND", "Not found");
	}

	const subscriber = await getSubscriberByReferralCode(code);
	if (!subscriber) {
		return apiError("NOT_FOUND", "Referral code not found");
	}

	// Get boost factor from waitlist page metadata
	const waitlistPage = await getPageBySlug("waitlist");
	const boostFactor = (waitlistPage?.metadata as { boostFactor?: number } | null)?.boostFactor ?? 5;

	const effectivePosition = calculateEffectivePosition(
		subscriber.position,
		subscriber.referralCount,
		boostFactor,
	);

	return apiSuccess({
		position: effectivePosition,
		referralCount: subscriber.referralCount,
		referralCode: subscriber.referralCode,
	});
}
