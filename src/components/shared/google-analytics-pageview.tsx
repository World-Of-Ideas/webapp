"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

declare global {
	interface Window {
		gtag?: (...args: unknown[]) => void;
	}
}

export function GoogleAnalyticsPageView({ measurementId }: { measurementId: string }) {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const isFirstRender = useRef(true);

	useEffect(() => {
		// Skip the first render — the inline script already fired page_view
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}
		window.gtag?.("config", measurementId, { page_path: pathname });
	}, [pathname, searchParams, measurementId]);

	return null;
}
