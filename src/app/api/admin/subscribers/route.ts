import { NextRequest } from "next/server";
import { apiSuccess, apiError, clampInt } from "@/lib/api";
import { requireAdminSession } from "@/lib/admin-auth";
import { getSiteSettingsDirect } from "@/lib/site-settings";
import { getSubscriberMode } from "@/lib/subscriber-mode";
import { getSubscribers } from "@/lib/subscribers";

export async function GET(request: NextRequest) {
	if (!(await requireAdminSession())) {
		return apiError("UNAUTHORIZED", "Not authenticated");
	}
	const settings = await getSiteSettingsDirect();
	if (getSubscriberMode(settings.features) === "off") {
		return apiError("NOT_FOUND", "Subscribers feature is not enabled");
	}

	const page = clampInt(request.nextUrl.searchParams.get("page"), 1, 1, 10000);
	const limit = clampInt(request.nextUrl.searchParams.get("limit"), 20, 1, 100);

	const { items, total } = await getSubscribers(page, limit);

	return apiSuccess({
		subscribers: items,
		pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
	});
}
