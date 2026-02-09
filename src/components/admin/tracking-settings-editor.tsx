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
		gaEnabled: boolean;
		gaMeasurementId: string;
		gaMpEnabled: boolean;
		hasGaMpApiSecret: boolean;
		gtmEnabled: boolean;
		gtmContainerId: string;
		utmTrackingEnabled: boolean;
		cookieConsentEnabled: boolean;
	};
}

export function TrackingSettingsEditor({ settings }: TrackingSettingsEditorProps) {
	const [metaPixelEnabled, setMetaPixelEnabled] = useState(settings.metaPixelEnabled);
	const [metaPixelId, setMetaPixelId] = useState(settings.metaPixelId);
	const [metaCapiEnabled, setMetaCapiEnabled] = useState(settings.metaCapiEnabled);
	const [metaCapiToken, setMetaCapiToken] = useState("");
	const [hasCapiToken, setHasCapiToken] = useState(settings.hasCapiToken);
	const [gaEnabled, setGaEnabled] = useState(settings.gaEnabled);
	const [gaMeasurementId, setGaMeasurementId] = useState(settings.gaMeasurementId);
	const [gaMpEnabled, setGaMpEnabled] = useState(settings.gaMpEnabled);
	const [gaMpApiSecret, setGaMpApiSecret] = useState("");
	const [hasGaMpApiSecret, setHasGaMpApiSecret] = useState(settings.hasGaMpApiSecret);
	const [gtmEnabled, setGtmEnabled] = useState(settings.gtmEnabled);
	const [gtmContainerId, setGtmContainerId] = useState(settings.gtmContainerId);
	const [utmTrackingEnabled, setUtmTrackingEnabled] = useState(settings.utmTrackingEnabled);
	const [cookieConsentEnabled, setCookieConsentEnabled] = useState(settings.cookieConsentEnabled);
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
				gaEnabled,
				gaMeasurementId,
				gaMpEnabled,
				gtmEnabled,
				gtmContainerId,
				utmTrackingEnabled,
				cookieConsentEnabled,
			};

			// Only send CAPI token if user typed something (or explicitly cleared it)
			if (metaCapiToken !== "") {
				payload.metaCapiToken = metaCapiToken;
			}

			// Only send GA MP API secret if user typed something (or explicitly cleared it)
			if (gaMpApiSecret !== "") {
				payload.gaMpApiSecret = gaMpApiSecret;
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
			if (gaMpApiSecret) {
				setHasGaMpApiSecret(true);
				setGaMpApiSecret("");
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

			{/* Google Analytics */}
			<Card>
				<CardHeader>
					<CardTitle>Google Analytics</CardTitle>
					<CardDescription>
						Track page views and events with Google Analytics 4
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<Label htmlFor="ga-enabled">Enable Google Analytics</Label>
						<Switch
							id="ga-enabled"
							checked={gaEnabled}
							onCheckedChange={setGaEnabled}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="ga-measurement-id">Measurement ID</Label>
						<Input
							id="ga-measurement-id"
							placeholder="G-XXXXXXXXXX"
							value={gaMeasurementId}
							onChange={(e) => setGaMeasurementId(e.target.value)}
						/>
						<p className="text-xs text-muted-foreground">
							Find your Measurement ID in Google Analytics under Admin &gt; Data Streams.
						</p>
					</div>
				</CardContent>
			</Card>

			{/* GA Measurement Protocol */}
			<Card>
				<CardHeader>
					<CardTitle>Measurement Protocol</CardTitle>
					<CardDescription>
						Send server-side events to Google Analytics for improved conversion tracking
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<Label htmlFor="ga-mp-enabled">Enable Measurement Protocol</Label>
						<Switch
							id="ga-mp-enabled"
							checked={gaMpEnabled}
							onCheckedChange={setGaMpEnabled}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="ga-mp-secret">API Secret</Label>
						<Input
							id="ga-mp-secret"
							type="password"
							placeholder={hasGaMpApiSecret ? "Secret saved (enter new to replace)" : "Paste your API secret"}
							value={gaMpApiSecret}
							onChange={(e) => setGaMpApiSecret(e.target.value)}
						/>
						<p className="text-xs text-muted-foreground">
							Create an API secret in Google Analytics under Admin &gt; Data Streams &gt; Measurement Protocol API secrets.
							{hasGaMpApiSecret && " A secret is currently configured."}
						</p>
					</div>
				</CardContent>
			</Card>

			{/* Google Tag Manager */}
			<Card>
				<CardHeader>
					<CardTitle>Google Tag Manager</CardTitle>
					<CardDescription>
						Manage tracking tags, triggers, and variables through GTM
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<Label htmlFor="gtm-enabled">Enable GTM</Label>
						<Switch
							id="gtm-enabled"
							checked={gtmEnabled}
							onCheckedChange={setGtmEnabled}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="gtm-container-id">Container ID</Label>
						<Input
							id="gtm-container-id"
							placeholder="GTM-XXXXXXX"
							value={gtmContainerId}
							onChange={(e) => setGtmContainerId(e.target.value)}
						/>
						<p className="text-xs text-muted-foreground">
							Find your Container ID in GTM under Admin &gt; Container Settings.
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

			{/* Cookie Consent */}
			<Card>
				<CardHeader>
					<CardTitle>Cookie Consent</CardTitle>
					<CardDescription>
						GDPR-compliant cookie consent banner for visitors
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<Label htmlFor="consent-enabled">Require Cookie Consent</Label>
						<Switch
							id="consent-enabled"
							checked={cookieConsentEnabled}
							onCheckedChange={setCookieConsentEnabled}
						/>
					</div>
					<p className="text-xs text-muted-foreground">
						When enabled, Analytics and Marketing tracking scripts are blocked until
						the visitor explicitly opts in via a cookie consent banner. Server-side
						tracking (CAPI, Measurement Protocol) is not affected.
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
