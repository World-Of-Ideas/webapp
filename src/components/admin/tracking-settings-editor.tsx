"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface TrackingSettingsEditorProps {
	settings: {
		metaPixelEnabled: boolean;
		metaPixelId: string;
		metaCapiEnabled: boolean;
		hasCapiToken: boolean;
		utmTrackingEnabled: boolean;
	};
}

export function TrackingSettingsEditor({ settings }: TrackingSettingsEditorProps) {
	const [metaPixelEnabled, setMetaPixelEnabled] = useState(settings.metaPixelEnabled);
	const [metaPixelId, setMetaPixelId] = useState(settings.metaPixelId);
	const [metaCapiEnabled, setMetaCapiEnabled] = useState(settings.metaCapiEnabled);
	const [metaCapiToken, setMetaCapiToken] = useState("");
	const [hasCapiToken, setHasCapiToken] = useState(settings.hasCapiToken);
	const [utmTrackingEnabled, setUtmTrackingEnabled] = useState(settings.utmTrackingEnabled);
	const [isSaving, setIsSaving] = useState(false);
	const [message, setMessage] = useState("");

	async function handleSave() {
		setIsSaving(true);
		setMessage("");

		try {
			const payload: Record<string, unknown> = {
				metaPixelEnabled,
				metaPixelId,
				metaCapiEnabled,
				utmTrackingEnabled,
			};

			// Only send CAPI token if user typed something (or explicitly cleared it)
			if (metaCapiToken !== "") {
				payload.metaCapiToken = metaCapiToken;
			}

			const res = await fetch("/api/admin/tracking", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			const data = (await res.json()) as { error?: { message: string } };

			if (!res.ok) {
				setMessage(data.error?.message ?? "Failed to save settings");
				return;
			}

			if (metaCapiToken) {
				setHasCapiToken(true);
				setMetaCapiToken("");
			}
			setMessage("Settings saved successfully");
		} catch {
			setMessage("Failed to save settings");
		} finally {
			setIsSaving(false);
		}
	}

	return (
		<div className="space-y-6">
			{/* Facebook Pixel */}
			<Card>
				<CardHeader>
					<CardTitle>Facebook Pixel</CardTitle>
					<CardDescription>
						Track page views and conversions with the Meta Pixel
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<Label htmlFor="pixel-enabled">Enable Pixel</Label>
						<Switch
							id="pixel-enabled"
							checked={metaPixelEnabled}
							onCheckedChange={setMetaPixelEnabled}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="pixel-id">Pixel ID</Label>
						<Input
							id="pixel-id"
							placeholder="123456789012345"
							value={metaPixelId}
							onChange={(e) => setMetaPixelId(e.target.value)}
						/>
						<p className="text-xs text-muted-foreground">
							Find your Pixel ID in Meta Events Manager. Must be digits only.
						</p>
					</div>
				</CardContent>
			</Card>

			{/* Conversion API */}
			<Card>
				<CardHeader>
					<CardTitle>Conversion API (CAPI)</CardTitle>
					<CardDescription>
						Send server-side events for improved attribution accuracy
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<Label htmlFor="capi-enabled">Enable CAPI</Label>
						<Switch
							id="capi-enabled"
							checked={metaCapiEnabled}
							onCheckedChange={setMetaCapiEnabled}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="capi-token">Access Token</Label>
						<Input
							id="capi-token"
							type="password"
							placeholder={hasCapiToken ? "Token saved (enter new to replace)" : "Paste your access token"}
							value={metaCapiToken}
							onChange={(e) => setMetaCapiToken(e.target.value)}
						/>
						<p className="text-xs text-muted-foreground">
							Generate a token in Meta Events Manager under Conversions API settings.
							{hasCapiToken && " A token is currently configured."}
						</p>
					</div>
				</CardContent>
			</Card>

			{/* UTM Tracking */}
			<Card>
				<CardHeader>
					<CardTitle>UTM Tracking</CardTitle>
					<CardDescription>
						Capture UTM parameters from form submissions
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<Label htmlFor="utm-enabled">Enable UTM Capture</Label>
						<Switch
							id="utm-enabled"
							checked={utmTrackingEnabled}
							onCheckedChange={setUtmTrackingEnabled}
						/>
					</div>
					<p className="text-xs text-muted-foreground">
						When enabled, UTM parameters (source, medium, campaign, term, content) are
						saved alongside form submissions for attribution analysis.
					</p>
				</CardContent>
			</Card>

			{message && (
				<p className={`text-sm ${message.includes("success") ? "text-green-600" : "text-destructive"}`}>
					{message}
				</p>
			)}

			<Button onClick={handleSave} disabled={isSaving}>
				{isSaving ? "Saving..." : "Save Settings"}
			</Button>
		</div>
	);
}
