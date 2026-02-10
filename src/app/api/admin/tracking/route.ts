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
		let body;
		try { body = await request.json(); } catch { return apiError("VALIDATION_ERROR", "Invalid JSON"); }
		const {
			metaPixelEnabled, metaPixelId, metaCapiEnabled, metaCapiToken,
			gaEnabled, gaMeasurementId, gaMpEnabled, gaMpApiSecret,
			gtmEnabled, gtmContainerId,
			utmTrackingEnabled, cookieConsentEnabled,
		} = body as Record<string, unknown>;

		// Validate boolean fields are actually booleans when provided
		const boolFields = { metaPixelEnabled, metaCapiEnabled, gaEnabled, gaMpEnabled, gtmEnabled, utmTrackingEnabled, cookieConsentEnabled };
		for (const [key, val] of Object.entries(boolFields)) {
			if (val !== undefined && typeof val !== "boolean") {
				return apiError("VALIDATION_ERROR", `${key} must be a boolean`);
			}
		}

		// Validate string fields are actually strings when provided
		const strFields = { metaPixelId, metaCapiToken, gaMeasurementId, gaMpApiSecret, gtmContainerId };
		for (const [key, val] of Object.entries(strFields)) {
			if (val !== undefined && typeof val !== "string") {
				return apiError("VALIDATION_ERROR", `${key} must be a string`);
			}
		}

		// After validation, cast to proper types
		const pixelId = metaPixelId as string | undefined;
		const capiToken = metaCapiToken as string | undefined;
		const measId = gaMeasurementId as string | undefined;
		const mpSecret = gaMpApiSecret as string | undefined;
		const containerId = gtmContainerId as string | undefined;

		// Validate pixel ID if provided — must be digits only, max 20 chars
		if (pixelId !== undefined && pixelId !== "" && (pixelId.length > 20 || !/^\d+$/.test(pixelId))) {
			return apiError("VALIDATION_ERROR", "Pixel ID must contain only digits (max 20)");
		}

		// Validate GA Measurement ID if provided — must match G-XXXXXXXXXX
		if (measId !== undefined && measId !== "" && (measId.length > 20 || !/^G-[A-Z0-9]+$/.test(measId))) {
			return apiError("VALIDATION_ERROR", "Measurement ID must start with G- followed by alphanumeric characters");
		}

		// Validate GTM Container ID if provided — must match GTM-XXXXXXX
		if (containerId !== undefined && containerId !== "" && (containerId.length > 20 || !/^GTM-[A-Z0-9]+$/.test(containerId))) {
			return apiError("VALIDATION_ERROR", "Container ID must start with GTM- followed by alphanumeric characters");
		}

		// Validate secret token lengths
		if (capiToken !== undefined && capiToken.length > 500) {
			return apiError("VALIDATION_ERROR", "CAPI token is too long (max 500)");
		}
		if (mpSecret !== undefined && mpSecret.length > 200) {
			return apiError("VALIDATION_ERROR", "GA API secret is too long (max 200)");
		}

		// Resolve CAPI token: empty string clears it, undefined keeps existing
		let resolvedCapiToken: string | null | undefined;
		if (capiToken === "") {
			resolvedCapiToken = null;
		} else if (capiToken !== undefined) {
			resolvedCapiToken = capiToken;
		}

		// Resolve GA MP API secret: empty string clears it, undefined keeps existing
		let resolvedGaMpApiSecret: string | null | undefined;
		if (mpSecret === "") {
			resolvedGaMpApiSecret = null;
		} else if (mpSecret !== undefined) {
			resolvedGaMpApiSecret = mpSecret;
		}

		await updateTrackingSettings({
			metaPixelEnabled: metaPixelEnabled as boolean | undefined,
			metaPixelId: pixelId !== undefined ? (pixelId || null) : undefined,
			metaCapiEnabled: metaCapiEnabled as boolean | undefined,
			metaCapiToken: resolvedCapiToken,
			gaEnabled: gaEnabled as boolean | undefined,
			gaMeasurementId: measId !== undefined ? (measId || null) : undefined,
			gaMpEnabled: gaMpEnabled as boolean | undefined,
			gaMpApiSecret: resolvedGaMpApiSecret,
			gtmEnabled: gtmEnabled as boolean | undefined,
			gtmContainerId: containerId !== undefined ? (containerId || null) : undefined,
			utmTrackingEnabled: utmTrackingEnabled as boolean | undefined,
			cookieConsentEnabled: cookieConsentEnabled as boolean | undefined,
		});

		return apiSuccess({ success: true });
	} catch {
		return apiError("INTERNAL_ERROR", "Failed to update tracking settings");
	}
}
