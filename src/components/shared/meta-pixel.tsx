import { Suspense } from "react";
import Script from "next/script";
import { cookies } from "next/headers";
import { getTrackingSettings } from "@/lib/tracking";
import { hasConsent, CONSENT_COOKIE_NAME } from "@/lib/cookies";
import { MetaPixelPageView } from "./meta-pixel-pageview";

export async function MetaPixel() {
	const settings = await getTrackingSettings();

	if (!settings?.metaPixelEnabled || !settings.metaPixelId) {
		return null;
	}

	// Validate pixel ID is digits only
	if (!/^\d+$/.test(settings.metaPixelId)) {
		return null;
	}

	if (settings.cookieConsentEnabled) {
		const cookieStore = await cookies();
		const consentValue = cookieStore.get(CONSENT_COOKIE_NAME)?.value;
		if (!hasConsent(true, consentValue, "marketing")) {
			return null;
		}
	}

	const pixelId = settings.metaPixelId;

	return (
		<>
			<Script id="fb-pixel" strategy="afterInteractive">
				{`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');`}
			</Script>
			<noscript>
				{/* eslint-disable-next-line @next/next/no-img-element -- Meta Pixel noscript tracker requires a plain img tag, not next/image */}
				<img
					height="1"
					width="1"
					style={{ display: "none" }}
					src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
					alt=""
				/>
			</noscript>
			<Suspense fallback={null}>
				<MetaPixelPageView pixelId={pixelId} />
			</Suspense>
		</>
	);
}
