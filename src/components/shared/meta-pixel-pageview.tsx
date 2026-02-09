"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

declare global {
	interface Window {
		fbq?: (...args: unknown[]) => void;
	}
}

export function MetaPixelPageView({ pixelId }: { pixelId: string }) {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const isFirstRender = useRef(true);

	useEffect(() => {
		// Skip the first render — the inline script already fired PageView
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}
		window.fbq?.("track", "PageView");
	}, [pathname, searchParams, pixelId]);

	return null;
}
