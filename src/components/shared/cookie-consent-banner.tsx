"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { setConsentCookie } from "@/lib/cookies";
import type { ConsentCategory } from "@/lib/cookies";

interface CategoryInfo {
	id: ConsentCategory;
	label: string;
	description: string;
}

interface CookieConsentBannerProps {
	categories: CategoryInfo[];
	currentConsent: ConsentCategory[] | null;
}

export function CookieConsentBanner({ categories, currentConsent }: CookieConsentBannerProps) {
	const router = useRouter();
	const [visible, setVisible] = useState(currentConsent === null);
	const [expanded, setExpanded] = useState(false);
	const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
		const initial: Record<string, boolean> = {};
		for (const cat of categories) {
			initial[cat.id] = currentConsent?.includes(cat.id) ?? false;
		}
		return initial;
	});

	const handleOpen = useCallback(() => {
		setVisible(true);
		setExpanded(true);
		const updated: Record<string, boolean> = {};
		for (const cat of categories) {
			updated[cat.id] = currentConsent?.includes(cat.id) ?? false;
		}
		setToggles(updated);
	}, [categories, currentConsent]);

	useEffect(() => {
		window.addEventListener("open-cookie-consent", handleOpen);
		return () => window.removeEventListener("open-cookie-consent", handleOpen);
	}, [handleOpen]);

	function save(accepted: ConsentCategory[]) {
		setConsentCookie(accepted);
		setVisible(false);
		setExpanded(false);
		router.refresh();
	}

	function handleAcceptAll() {
		save(categories.map((c) => c.id));
	}

	function handleRejectAll() {
		save([]);
	}

	function handleSavePreferences() {
		const accepted = categories.filter((c) => toggles[c.id]).map((c) => c.id);
		save(accepted);
	}

	if (!visible) return null;

	return (
		<div className="fixed inset-x-0 bottom-0 z-[100] border-t bg-background shadow-lg" aria-label="Cookie consent" role="dialog">
			<div className="container mx-auto px-4 py-4">
				{!expanded ? (
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<p className="text-sm text-muted-foreground">
							We use cookies to improve your experience and analyze site traffic.
						</p>
						<div className="flex shrink-0 gap-2">
							<Button variant="outline" size="sm" onClick={handleRejectAll}>
								Reject All
							</Button>
							<Button variant="outline" size="sm" onClick={() => setExpanded(true)}>
								Customize
							</Button>
							<Button size="sm" onClick={handleAcceptAll}>
								Accept All
							</Button>
						</div>
					</div>
				) : (
					<div className="space-y-4">
						<div>
							<h2 className="text-lg font-semibold">Cookie Preferences</h2>
							<p className="text-sm text-muted-foreground">
								Choose which cookies you&apos;d like to allow. Necessary cookies are always enabled.
							</p>
						</div>

						<div className="space-y-3">
							<div className="flex items-center justify-between rounded-lg border p-3">
								<div>
									<Label className="font-medium">Necessary</Label>
									<p className="text-xs text-muted-foreground">
										Essential for the site to function. Cannot be disabled.
									</p>
								</div>
								<Switch checked disabled />
							</div>

							{categories.map((cat) => (
								<div key={cat.id} className="flex items-center justify-between rounded-lg border p-3">
									<div className="mr-4">
										<Label htmlFor={`consent-${cat.id}`} className="font-medium">
											{cat.label}
										</Label>
										<p className="text-xs text-muted-foreground">{cat.description}</p>
									</div>
									<Switch
										id={`consent-${cat.id}`}
										checked={toggles[cat.id] ?? false}
										onCheckedChange={(checked) =>
											setToggles((prev) => ({ ...prev, [cat.id]: checked }))
										}
									/>
								</div>
							))}
						</div>

						<div className="flex gap-2">
							<Button variant="outline" size="sm" onClick={handleRejectAll}>
								Reject All
							</Button>
							<Button variant="outline" size="sm" onClick={handleAcceptAll}>
								Accept All
							</Button>
							<Button size="sm" onClick={handleSavePreferences}>
								Save Preferences
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
