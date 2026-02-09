import { NextRequest } from "next/server";
import { siteConfig } from "@/config/site";
import { apiSuccess, apiError } from "@/lib/api";
import { recordGiveawayAction, getGiveawayEntryByEmail, isGiveawayEnded } from "@/lib/giveaway";
import { getPageBySlug } from "@/lib/pages";

const ALLOWED_ACTIONS = [
	"twitter_follow",
	"twitter_retweet",
	"discord_join",
	"instagram_follow",
	"newsletter_signup",
];

function isValidAction(action: string): boolean {
	if (action.startsWith("referral:")) return true;
	return ALLOWED_ACTIONS.includes(action);
}

export async function POST(request: NextRequest) {
	if (!siteConfig.features.giveaway) {
		return apiError("NOT_FOUND", "Giveaway is not available");
	}

	try {
		const body = await request.json();
		const { email, action, metadata } = body as {
			email?: string;
			action?: string;
			metadata?: string;
		};

		if (!email || !action) {
			return apiError("VALIDATION_ERROR", "Email and action are required");
		}

		if (!isValidAction(action)) {
			return apiError("VALIDATION_ERROR", "Unknown action type");
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

		// Determine bonus entries from giveaway page metadata
		const actionType = action.startsWith("referral:") ? "referral" : action.replace("twitter_", "");
		const bonusEntries = giveawayMeta?.bonusEntries?.[actionType] ?? 1;

		await recordGiveawayAction({
			entryId: entry.id,
			action,
			bonusEntries,
			metadata,
		});

		return apiSuccess({ success: true });
	} catch (err) {
		// Handle unique constraint violation (duplicate action)
		if (err instanceof Error && err.message.includes("UNIQUE")) {
			return apiError("DUPLICATE_ACTION", "This action has already been completed");
		}
		return apiError("INTERNAL_ERROR", "An unexpected error occurred");
	}
}
