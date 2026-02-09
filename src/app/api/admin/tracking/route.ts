import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api";
import { requireAdminSession } from "@/lib/admin-auth";
import { getTrackingSettings, updateTrackingSettings } from "@/lib/tracking";

export async function GET() {
	if (!(await requireAdminSession())) {
		return apiError("UNAUTHORIZED", "Not authenticated");
	}

	const settings = await getTrackingSettings();

	return apiSuccess({
		metaPixelEnabled: settings?.metaPixelEnabled ?? false,
		metaPixelId: settings?.metaPixelId ?? "",
		metaCapiEnabled: settings?.metaCapiEnabled ?? false,
		hasCapiToken: !!settings?.metaCapiToken,
		utmTrackingEnabled: settings?.utmTrackingEnabled ?? true,
	});
}

export async function PUT(request: NextRequest) {
	if (!(await requireAdminSession())) {
		return apiError("UNAUTHORIZED", "Not authenticated");
	}

	try {
		const body = await request.json();
		const { metaPixelEnabled, metaPixelId, metaCapiEnabled, metaCapiToken, utmTrackingEnabled } = body as {
			metaPixelEnabled?: boolean;
			metaPixelId?: string;
			metaCapiEnabled?: boolean;
			metaCapiToken?: string;
			utmTrackingEnabled?: boolean;
		};

		// Validate pixel ID if provided — must be digits only
		if (metaPixelId !== undefined && metaPixelId !== "" && !/^\d+$/.test(metaPixelId)) {
			return apiError("VALIDATION_ERROR", "Pixel ID must contain only digits");
		}

		// Resolve CAPI token: empty string clears it, undefined keeps existing
		let resolvedCapiToken: string | null | undefined;
		if (metaCapiToken === "") {
			resolvedCapiToken = null;
		} else if (metaCapiToken !== undefined) {
			resolvedCapiToken = metaCapiToken;
		}

		await updateTrackingSettings({
			metaPixelEnabled,
			metaPixelId: metaPixelId !== undefined ? (metaPixelId || null) : undefined,
			metaCapiEnabled,
			metaCapiToken: resolvedCapiToken,
			utmTrackingEnabled,
		});

		return apiSuccess({ success: true });
	} catch {
		return apiError("INTERNAL_ERROR", "Failed to update tracking settings");
	}
}
