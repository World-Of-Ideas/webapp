"use client";

import { useState, useSyncExternalStore, useCallback } from "react";
import Link from "next/link";
import type { AnnouncementSettings } from "@/types/site-settings";
import { isSafeUrl } from "@/lib/utils";

interface AnnouncementBarProps {
	announcement: AnnouncementSettings;
}

const STORAGE_KEY = "announcement-dismissed";

function getServerSnapshot() {
	return true; // Treat as dismissed on server to avoid flash
}

export function AnnouncementBar({ announcement }: AnnouncementBarProps) {
	const [dismissed, setDismissed] = useState(false);

	const subscribe = useCallback(() => () => {}, []);
	const getSnapshot = useCallback(() => {
		try {
			return sessionStorage.getItem(STORAGE_KEY) === announcement.text;
		} catch {
			return false;
		}
	}, [announcement.text]);

	const storageDismissed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

	if (!announcement.enabled || !announcement.text || dismissed || storageDismissed) return null;

	const handleDismiss = () => {
		setDismissed(true);
		try {
			sessionStorage.setItem(STORAGE_KEY, announcement.text);
		} catch {
			// sessionStorage may not be available
		}
	};

	return (
		<div className="relative bg-primary px-4 py-2 text-center text-sm text-primary-foreground">
			<p className="mx-auto max-w-3xl">
				{announcement.text}
				{announcement.linkUrl && announcement.linkText && isSafeUrl(announcement.linkUrl) && (
					<>
						{" "}
						<Link href={announcement.linkUrl} className="font-medium underline underline-offset-2 hover:opacity-80">
							{announcement.linkText}
						</Link>
					</>
				)}
			</p>
			<button
				type="button"
				onClick={handleDismiss}
				className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-primary-foreground/70 hover:text-primary-foreground"
				aria-label="Dismiss announcement"
			>
				&times;
			</button>
		</div>
	);
}
