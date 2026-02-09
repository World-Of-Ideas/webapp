import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { trackingSettings } from "@/db/schema";

export type TrackingSettings = typeof trackingSettings.$inferSelect;

export async function getTrackingSettings(): Promise<TrackingSettings | null> {
	const db = await getDb();
	const row = await db.query.trackingSettings.findFirst({
		where: eq(trackingSettings.id, 1),
	});
	return row ?? null;
}

export async function updateTrackingSettings(data: {
	metaPixelEnabled?: boolean;
	metaPixelId?: string | null;
	metaCapiEnabled?: boolean;
	metaCapiToken?: string | null;
	gaEnabled?: boolean;
	gaMeasurementId?: string | null;
	gaMpEnabled?: boolean;
	gaMpApiSecret?: string | null;
	gtmEnabled?: boolean;
	gtmContainerId?: string | null;
	utmTrackingEnabled?: boolean;
	cookieConsentEnabled?: boolean;
}) {
	const db = await getDb();

	await db
		.insert(trackingSettings)
		.values({
			id: 1,
			metaPixelEnabled: data.metaPixelEnabled ?? false,
			metaPixelId: data.metaPixelId ?? null,
			metaCapiEnabled: data.metaCapiEnabled ?? false,
			metaCapiToken: data.metaCapiToken ?? null,
			gaEnabled: data.gaEnabled ?? false,
			gaMeasurementId: data.gaMeasurementId ?? null,
			gaMpEnabled: data.gaMpEnabled ?? false,
			gaMpApiSecret: data.gaMpApiSecret ?? null,
			gtmEnabled: data.gtmEnabled ?? false,
			gtmContainerId: data.gtmContainerId ?? null,
			utmTrackingEnabled: data.utmTrackingEnabled ?? true,
			cookieConsentEnabled: data.cookieConsentEnabled ?? false,
			updatedAt: sql`datetime('now')`,
		})
		.onConflictDoUpdate({
			target: trackingSettings.id,
			set: {
				...(data.metaPixelEnabled !== undefined && { metaPixelEnabled: data.metaPixelEnabled }),
				...(data.metaPixelId !== undefined && { metaPixelId: data.metaPixelId }),
				...(data.metaCapiEnabled !== undefined && { metaCapiEnabled: data.metaCapiEnabled }),
				...(data.metaCapiToken !== undefined && { metaCapiToken: data.metaCapiToken }),
				...(data.gaEnabled !== undefined && { gaEnabled: data.gaEnabled }),
				...(data.gaMeasurementId !== undefined && { gaMeasurementId: data.gaMeasurementId }),
				...(data.gaMpEnabled !== undefined && { gaMpEnabled: data.gaMpEnabled }),
				...(data.gaMpApiSecret !== undefined && { gaMpApiSecret: data.gaMpApiSecret }),
				...(data.gtmEnabled !== undefined && { gtmEnabled: data.gtmEnabled }),
				...(data.gtmContainerId !== undefined && { gtmContainerId: data.gtmContainerId }),
				...(data.utmTrackingEnabled !== undefined && { utmTrackingEnabled: data.utmTrackingEnabled }),
				...(data.cookieConsentEnabled !== undefined && { cookieConsentEnabled: data.cookieConsentEnabled }),
				updatedAt: sql`datetime('now')`,
			},
		});
}

const encoder = new TextEncoder();

export async function hashForMeta(value: string): Promise<string> {
	const normalized = value.trim().toLowerCase();
	const digest = await crypto.subtle.digest("SHA-256", encoder.encode(normalized));
	return Array.from(new Uint8Array(digest))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

export async function sendMetaConversionEvent(params: {
	eventName: string;
	eventId: string;
	email?: string;
	sourceUrl: string;
	ip?: string;
	userAgent?: string;
}): Promise<void> {
	const settings = await getTrackingSettings();
	if (!settings?.metaCapiEnabled || !settings.metaCapiToken || !settings.metaPixelId) {
		return;
	}

	const userData: Record<string, string> = {};
	if (params.email) {
		userData.em = await hashForMeta(params.email);
	}
	if (params.ip) {
		userData.client_ip_address = params.ip;
	}
	if (params.userAgent) {
		userData.client_user_agent = params.userAgent;
	}

	const payload = {
		data: [
			{
				event_name: params.eventName,
				event_time: Math.floor(Date.now() / 1000),
				event_id: params.eventId,
				event_source_url: params.sourceUrl,
				action_source: "website",
				user_data: userData,
			},
		],
	};

	try {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 5000);

		await fetch(
			`https://graph.facebook.com/v21.0/${settings.metaPixelId}/events?access_token=${settings.metaCapiToken}`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
				signal: controller.signal,
			},
		);

		clearTimeout(timeout);
	} catch {
		// Fire-and-forget: don't let CAPI errors affect the request
	}
}

export async function sendGaConversionEvent(params: {
	eventName: string;
	email?: string;
	sourceUrl: string;
}): Promise<void> {
	const settings = await getTrackingSettings();
	if (!settings?.gaMpEnabled || !settings.gaMpApiSecret || !settings.gaMeasurementId) {
		return;
	}

	const payload = {
		client_id: crypto.randomUUID(),
		events: [
			{
				name: params.eventName,
				params: {
					source_url: params.sourceUrl,
				},
			},
		],
	};

	try {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 5000);

		await fetch(
			`https://www.google-analytics.com/mp/collect?measurement_id=${settings.gaMeasurementId}&api_secret=${settings.gaMpApiSecret}`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
				signal: controller.signal,
			},
		);

		clearTimeout(timeout);
	} catch {
		// Fire-and-forget: don't let GA MP errors affect the request
	}
}
