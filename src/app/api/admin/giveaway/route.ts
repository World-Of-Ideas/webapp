import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api";
import { requireAdminSession } from "@/lib/admin-auth";
import { getGiveawayEntries, getGiveawayStats } from "@/lib/giveaway";

export async function GET(request: NextRequest) {
	if (!(await requireAdminSession())) {
		return apiError("UNAUTHORIZED", "Not authenticated");
	}

	const page = Number(request.nextUrl.searchParams.get("page") ?? "1");
	const limit = Number(request.nextUrl.searchParams.get("limit") ?? "20");

	const [{ items, total }, stats] = await Promise.all([
		getGiveawayEntries(page, limit),
		getGiveawayStats(),
	]);

	return apiSuccess({
		entries: items,
		stats,
		pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
	});
}
