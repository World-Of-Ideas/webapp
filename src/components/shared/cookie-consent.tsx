import { cookies } from "next/headers";
import { getTrackingSettings } from "@/lib/tracking";
import { CONSENT_COOKIE_NAME, parseConsentCookie } from "@/lib/cookies";
import type { ConsentCategory } from "@/lib/cookies";
import { CookieConsentBanner } from "./cookie-consent-banner";

interface CategoryInfo {
	id: ConsentCategory;
	label: string;
	description: string;
}

export async function CookieConsent() {
	const settings = await getTrackingSettings();

	if (!settings?.cookieConsentEnabled) return null;

	const categories: CategoryInfo[] = [];

	const hasAnalytics =
		(settings.gaEnabled && settings.gaMeasurementId) ||
		(settings.gtmEnabled && settings.gtmContainerId);

	if (hasAnalytics) {
		categories.push({
			id: "analytics",
			label: "Analytics",
			description: "Help us understand how visitors interact with our site by collecting anonymous usage data.",
		});
	}

	if (settings.metaPixelEnabled && settings.metaPixelId) {
		categories.push({
			id: "marketing",
			label: "Marketing",
			description: "Allow us to measure the effectiveness of our advertising campaigns.",
		});
	}

	if (categories.length === 0) return null;

	const cookieStore = await cookies();
	const consentValue = cookieStore.get(CONSENT_COOKIE_NAME)?.value;
	const consent = parseConsentCookie(consentValue);
	const currentConsent = consent ? Array.from(consent) : null;

	return <CookieConsentBanner categories={categories} currentConsent={currentConsent} />;
}
