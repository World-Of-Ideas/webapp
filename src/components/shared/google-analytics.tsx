import { Suspense } from "react";
import Script from "next/script";
import { cookies } from "next/headers";
import { getTrackingSettings } from "@/lib/tracking";
import { hasConsent, CONSENT_COOKIE_NAME } from "@/lib/cookies";
import { GoogleAnalyticsPageView } from "./google-analytics-pageview";

export async function GoogleAnalytics() {
	const settings = await getTrackingSettings();

	if (!settings?.gaEnabled || !settings.gaMeasurementId) {
		return null;
	}

	// Validate measurement ID format: G-XXXXXXXXXX
	if (!/^G-[A-Z0-9]+$/.test(settings.gaMeasurementId)) {
		return null;
	}

	if (settings.cookieConsentEnabled) {
		const cookieStore = await cookies();
		const consentValue = cookieStore.get(CONSENT_COOKIE_NAME)?.value;
		if (!hasConsent(true, consentValue, "analytics")) {
			return null;
		}
	}

	const measurementId = settings.gaMeasurementId;

	return (
		<>
			<Script
				src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
				strategy="afterInteractive"
			/>
			<Script id="ga-config" strategy="afterInteractive">
				{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${measurementId}');`}
			</Script>
			<Suspense fallback={null}>
				<GoogleAnalyticsPageView measurementId={measurementId} />
			</Suspense>
		</>
	);
}
