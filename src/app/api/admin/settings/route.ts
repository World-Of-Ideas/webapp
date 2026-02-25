import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api";
import { requireAdminSession } from "@/lib/admin-auth";
import { getSiteSettingsDirect, updateSiteSettings, invalidateSiteSettingsCache } from "@/lib/site-settings";
import { validateSiteSettingsBody } from "@/lib/validation";

export async function GET() {
	if (!(await requireAdminSession())) {
		return apiError("UNAUTHORIZED", "Not authenticated");
	}

	const settings = await getSiteSettingsDirect();
	return apiSuccess(settings);
}

export async function PUT(request: NextRequest) {
	if (!(await requireAdminSession())) {
		return apiError("UNAUTHORIZED", "Not authenticated");
	}

	try {
		let body: unknown;
		try { body = await request.json(); } catch { return apiError("VALIDATION_ERROR", "Invalid JSON"); }

		const validationErr = validateSiteSettingsBody(body);
		if (validationErr) {
			return apiError("VALIDATION_ERROR", validationErr);
		}

		const b = body as Record<string, unknown>;

		await updateSiteSettings({
			name: b.name as string | undefined,
			description: b.description as string | undefined,
			author: b.author as string | undefined,
			social: b.social as Record<string, string> | undefined,
			productLinks: b.productLinks as Record<string, string> | undefined,
			features: b.features as Record<string, boolean> | undefined,
			ui: b.ui as Record<string, boolean> | undefined,
			theme: b.theme as Record<string, unknown> | undefined,
			logoUrl: b.logoUrl as string | null | undefined,
		});

		invalidateSiteSettingsCache();

		return apiSuccess({ success: true });
	} catch {
		return apiError("INTERNAL_ERROR", "Failed to update settings");
	}
}
