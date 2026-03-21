import Script from "next/script";
import { cookies } from "next/headers";
import { getTrackingSettings } from "@/lib/tracking";
import { hasConsent, CONSENT_COOKIE_NAME } from "@/lib/cookies";

export async function GoogleTagManager() {
	const settings = await getTrackingSettings();

	if (!settings?.gtmEnabled || !settings.gtmContainerId) {
		return null;
	}

	// Validate container ID format: GTM-XXXXXXX
	if (!/^GTM-[A-Z0-9]+$/.test(settings.gtmContainerId)) {
		return null;
	}

	let analyticsConsent = true;
	let marketingConsent = true;

	if (settings.cookieConsentEnabled) {
		const cookieStore = await cookies();
		const consentValue = cookieStore.get(CONSENT_COOKIE_NAME)?.value;
		if (!hasConsent(true, consentValue, "analytics")) {
			return null;
		}
		marketingConsent = hasConsent(true, consentValue, "marketing");
		analyticsConsent = true; // Already checked above
	}

	const containerId = settings.gtmContainerId;
	const needsConsentMode = settings.cookieConsentEnabled;

	const analyticsStorage = analyticsConsent ? "granted" : "denied";
	const adStorage = marketingConsent ? "granted" : "denied";

	return (
		<>
			{/* eslint-disable @next/next/no-before-interactive-script-outside-document -- App Router has no _document.js */}
			{needsConsentMode && (
				<Script id="gtm-consent-mode" strategy="beforeInteractive">
					{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('consent','default',{'analytics_storage':'${analyticsStorage}','ad_storage':'${adStorage}','ad_user_data':'${adStorage}','ad_personalization':'${adStorage}'});`}
				</Script>
			)}
			{/* eslint-enable @next/next/no-before-interactive-script-outside-document */}
			<Script id="gtm-script" strategy="afterInteractive">
				{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${containerId}');`}
			</Script>
			<noscript>
				<iframe
					src={`https://www.googletagmanager.com/ns.html?id=${containerId}`}
					height="0"
					width="0"
					style={{ display: "none", visibility: "hidden" }}
					title="Google Tag Manager"
				/>
			</noscript>
		</>
	);
}
