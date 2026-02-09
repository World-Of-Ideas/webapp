import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api";
import { getSubscriberByReferralCode } from "@/lib/waitlist";
import { getPageBySlug } from "@/lib/pages";
import { calculateEffectivePosition } from "@/lib/referral";

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ code: string }> },
) {
	const { code } = await params;

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
