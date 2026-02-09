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
		gaEnabled: settings?.gaEnabled ?? false,
		gaMeasurementId: settings?.gaMeasurementId ?? "",
		gaMpEnabled: settings?.gaMpEnabled ?? false,
		hasGaMpApiSecret: !!settings?.gaMpApiSecret,
		gtmEnabled: settings?.gtmEnabled ?? false,
		gtmContainerId: settings?.gtmContainerId ?? "",
		utmTrackingEnabled: settings?.utmTrackingEnabled ?? true,
		cookieConsentEnabled: settings?.cookieConsentEnabled ?? false,
	});
}

export async function PUT(request: NextRequest) {
	if (!(await requireAdminSession())) {
		return apiError("UNAUTHORIZED", "Not authenticated");
	}

	try {
		const body = await request.json();
		const {
			metaPixelEnabled, metaPixelId, metaCapiEnabled, metaCapiToken,
			gaEnabled, gaMeasurementId, gaMpEnabled, gaMpApiSecret,
			gtmEnabled, gtmContainerId,
			utmTrackingEnabled, cookieConsentEnabled,
		} = body as {
			metaPixelEnabled?: boolean;
			metaPixelId?: string;
			metaCapiEnabled?: boolean;
			metaCapiToken?: string;
			gaEnabled?: boolean;
			gaMeasurementId?: string;
			gaMpEnabled?: boolean;
			gaMpApiSecret?: string;
			gtmEnabled?: boolean;
			gtmContainerId?: string;
			utmTrackingEnabled?: boolean;
			cookieConsentEnabled?: boolean;
		};

		// Validate pixel ID if provided — must be digits only
		if (metaPixelId !== undefined && metaPixelId !== "" && !/^\d+$/.test(metaPixelId)) {
			return apiError("VALIDATION_ERROR", "Pixel ID must contain only digits");
		}

		// Validate GA Measurement ID if provided — must match G-XXXXXXXXXX
		if (gaMeasurementId !== undefined && gaMeasurementId !== "" && !/^G-[A-Z0-9]+$/.test(gaMeasurementId)) {
			return apiError("VALIDATION_ERROR", "Measurement ID must start with G- followed by alphanumeric characters");
		}

		// Validate GTM Container ID if provided — must match GTM-XXXXXXX
		if (gtmContainerId !== undefined && gtmContainerId !== "" && !/^GTM-[A-Z0-9]+$/.test(gtmContainerId)) {
			return apiError("VALIDATION_ERROR", "Container ID must start with GTM- followed by alphanumeric characters");
		}

		// Resolve CAPI token: empty string clears it, undefined keeps existing
		let resolvedCapiToken: string | null | undefined;
		if (metaCapiToken === "") {
			resolvedCapiToken = null;
		} else if (metaCapiToken !== undefined) {
			resolvedCapiToken = metaCapiToken;
		}

		// Resolve GA MP API secret: empty string clears it, undefined keeps existing
		let resolvedGaMpApiSecret: string | null | undefined;
		if (gaMpApiSecret === "") {
			resolvedGaMpApiSecret = null;
		} else if (gaMpApiSecret !== undefined) {
			resolvedGaMpApiSecret = gaMpApiSecret;
		}

		await updateTrackingSettings({
			metaPixelEnabled,
			metaPixelId: metaPixelId !== undefined ? (metaPixelId || null) : undefined,
			metaCapiEnabled,
			metaCapiToken: resolvedCapiToken,
			gaEnabled,
			gaMeasurementId: gaMeasurementId !== undefined ? (gaMeasurementId || null) : undefined,
			gaMpEnabled,
			gaMpApiSecret: resolvedGaMpApiSecret,
			gtmEnabled,
			gtmContainerId: gtmContainerId !== undefined ? (gtmContainerId || null) : undefined,
			utmTrackingEnabled,
			cookieConsentEnabled,
		});

		return apiSuccess({ success: true });
	} catch {
		return apiError("INTERNAL_ERROR", "Failed to update tracking settings");
	}
}
