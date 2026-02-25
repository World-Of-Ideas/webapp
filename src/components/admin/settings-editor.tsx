"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { themePresets } from "@/config/theme-presets";
import type { SiteSettings, ThemeSettings } from "@/types/site-settings";

interface SettingsEditorProps {
	settings: SiteSettings;
}

const BORDER_RADIUS_OPTIONS = [
	{ label: "None", value: "0" },
	{ label: "Subtle", value: "0.375rem" },
	{ label: "Rounded", value: "0.625rem" },
	{ label: "Pill", value: "9999px" },
];

const HEADING_WEIGHT_OPTIONS = [
	{ label: "Light (300)", value: "300" },
	{ label: "Normal (400)", value: "400" },
	{ label: "Semi-bold (600)", value: "600" },
	{ label: "Bold (700)", value: "700" },
];

const FONT_OPTIONS = [
	{ label: "Inter", value: "inter" },
	{ label: "Geist", value: "geist" },
	{ label: "DM Sans", value: "dm-sans" },
	{ label: "Space Grotesk", value: "space-grotesk" },
];

const HERO_VARIANTS = [
	{ label: "Centered", value: "centered" },
	{ label: "Gradient", value: "gradient" },
	{ label: "Split", value: "split" },
];

const HEADER_VARIANTS = [
	{ label: "Solid", value: "solid" },
	{ label: "Blur", value: "blur" },
	{ label: "Transparent", value: "transparent" },
];

const FOOTER_VARIANTS = [
	{ label: "Simple", value: "simple" },
	{ label: "Columns", value: "columns" },
	{ label: "Dark", value: "dark" },
];

const CARD_VARIANTS = [
	{ label: "Bordered", value: "bordered" },
	{ label: "Filled", value: "filled" },
	{ label: "Minimal", value: "minimal" },
];

const CTA_VARIANTS = [
	{ label: "Gradient", value: "gradient" },
	{ label: "Solid", value: "solid" },
	{ label: "Outlined", value: "outlined" },
];

export function SettingsEditor({ settings }: SettingsEditorProps) {
	// General
	const [name, setName] = useState(settings.name);
	const [description, setDescription] = useState(settings.description);
	const [author, setAuthor] = useState(settings.author);

	// Product Links
	const [appUrl, setAppUrl] = useState(settings.productLinks.appUrl);
	const [appStoreUrl, setAppStoreUrl] = useState(settings.productLinks.appStoreUrl);
	const [playStoreUrl, setPlayStoreUrl] = useState(settings.productLinks.playStoreUrl);

	// Social Links
	const [twitter, setTwitter] = useState(settings.social.twitter);
	const [github, setGithub] = useState(settings.social.github);
	const [discord, setDiscord] = useState(settings.social.discord);
	const [instagram, setInstagram] = useState(settings.social.instagram);

	// Features
	const [features, setFeatures] = useState(settings.features);

	// UI
	const [ui, setUi] = useState(settings.ui);

	// Theme
	const [theme, setTheme] = useState<ThemeSettings>(settings.theme);

	// Save state
	const [isSaving, setIsSaving] = useState(false);
	const [message, setMessage] = useState("");
	const [isError, setIsError] = useState(false);

	const router = useRouter();

	function toggleFeature(key: string) {
		setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
	}

	function toggleUi(key: string) {
		setUi((prev) => ({ ...prev, [key]: !prev[key] }));
	}

	function updateTheme(partial: Partial<ThemeSettings>) {
		setTheme((prev) => ({ ...prev, ...partial }));
	}

	function applyPreset(presetKey: string) {
		const preset = themePresets[presetKey];
		if (preset) {
			setTheme(preset);
		}
	}

	async function handleSave() {
		setIsSaving(true);
		setMessage("");

		try {
			const res = await fetch("/api/admin/settings", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name,
					description,
					author,
					social: { twitter, github, discord, instagram },
					productLinks: { appUrl, appStoreUrl, playStoreUrl },
					features,
					ui,
					theme,
				}),
			});

			const data = (await res.json()) as { error?: { message: string } };

			if (!res.ok) {
				setIsError(true);
				setMessage(data.error?.message ?? "Failed to save settings");
				return;
			}

			setIsError(false);
			setMessage("Settings saved successfully");
			router.refresh();
		} catch {
			setIsError(true);
			setMessage("Failed to save settings");
		} finally {
			setIsSaving(false);
		}
	}

	return (
		<div className="space-y-6">
			{/* General */}
			<Card>
				<CardHeader>
					<CardTitle>General</CardTitle>
					<CardDescription>Site identity and metadata</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="site-name">Site Name</Label>
						<Input id="site-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={200} />
					</div>
					<div className="space-y-2">
						<Label htmlFor="site-description">Description</Label>
						<Input id="site-description" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} />
					</div>
					<div className="space-y-2">
						<Label htmlFor="site-author">Author / Company</Label>
						<Input id="site-author" value={author} onChange={(e) => setAuthor(e.target.value)} maxLength={200} />
					</div>
				</CardContent>
			</Card>

			{/* Product Links */}
			<Card>
				<CardHeader>
					<CardTitle>Product Links</CardTitle>
					<CardDescription>Links to your product (used when waitlist is disabled)</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="app-url">Web App URL</Label>
						<Input id="app-url" placeholder="https://app.example.com" value={appUrl} onChange={(e) => setAppUrl(e.target.value)} />
					</div>
					<div className="space-y-2">
						<Label htmlFor="appstore-url">App Store URL</Label>
						<Input id="appstore-url" placeholder="https://apps.apple.com/..." value={appStoreUrl} onChange={(e) => setAppStoreUrl(e.target.value)} />
					</div>
					<div className="space-y-2">
						<Label htmlFor="playstore-url">Play Store URL</Label>
						<Input id="playstore-url" placeholder="https://play.google.com/..." value={playStoreUrl} onChange={(e) => setPlayStoreUrl(e.target.value)} />
					</div>
				</CardContent>
			</Card>

			{/* Social Links */}
			<Card>
				<CardHeader>
					<CardTitle>Social Links</CardTitle>
					<CardDescription>Shown in footer and share buttons</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="social-twitter">Twitter</Label>
						<Input id="social-twitter" placeholder="@yourhandle" value={twitter} onChange={(e) => setTwitter(e.target.value)} />
					</div>
					<div className="space-y-2">
						<Label htmlFor="social-github">GitHub</Label>
						<Input id="social-github" placeholder="https://github.com/yourorg" value={github} onChange={(e) => setGithub(e.target.value)} />
					</div>
					<div className="space-y-2">
						<Label htmlFor="social-discord">Discord</Label>
						<Input id="social-discord" placeholder="https://discord.gg/yourserver" value={discord} onChange={(e) => setDiscord(e.target.value)} />
					</div>
					<div className="space-y-2">
						<Label htmlFor="social-instagram">Instagram</Label>
						<Input id="social-instagram" placeholder="https://instagram.com/yourhandle" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
					</div>
				</CardContent>
			</Card>

			{/* Features */}
			<Card>
				<CardHeader>
					<CardTitle>Features</CardTitle>
					<CardDescription>Enable or disable site features</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{Object.entries(features).map(([key, enabled]) => (
						<div key={key} className="flex items-center justify-between">
							<Label htmlFor={`feature-${key}`} className="capitalize">{key}</Label>
							<Switch id={`feature-${key}`} checked={enabled} onCheckedChange={() => toggleFeature(key)} />
						</div>
					))}
				</CardContent>
			</Card>

			{/* UI */}
			<Card>
				<CardHeader>
					<CardTitle>UI</CardTitle>
					<CardDescription>Toggle UI elements</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{Object.entries(ui).map(([key, enabled]) => (
						<div key={key} className="flex items-center justify-between">
							<Label htmlFor={`ui-${key}`}>{key === "search" ? "Search (Cmd+K)" : key === "themeToggle" ? "Theme Toggle" : key}</Label>
							<Switch id={`ui-${key}`} checked={enabled} onCheckedChange={() => toggleUi(key)} />
						</div>
					))}
				</CardContent>
			</Card>

			{/* Branding / Theme */}
			<Card>
				<CardHeader>
					<CardTitle>Branding</CardTitle>
					<CardDescription>Theme presets, colors, fonts, and component variants</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Preset selector */}
					<div className="space-y-2">
						<Label>Preset</Label>
						<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
							{Object.entries(themePresets).map(([key, preset]) => (
								<button
									key={key}
									type="button"
									onClick={() => applyPreset(key)}
									className={`rounded-lg border p-3 text-left text-sm font-medium transition-colors hover:bg-accent ${
										theme.preset === key ? "border-primary bg-accent" : ""
									}`}
								>
									<span className="mr-2 inline-block h-3 w-3 rounded-full" style={{ backgroundColor: preset.accentColor }} />
									<span className="capitalize">{key}</span>
								</button>
							))}
						</div>
					</div>

					{/* Accent color */}
					<div className="space-y-2">
						<Label htmlFor="accent-color">Accent Color</Label>
						<div className="flex items-center gap-2">
							<input
								type="color"
								id="accent-color-picker"
								aria-label="Accent color picker"
								value={theme.accentColor}
								onChange={(e) => updateTheme({ accentColor: e.target.value })}
								className="h-9 w-9 cursor-pointer rounded border"
							/>
							<Input
								id="accent-color"
								value={theme.accentColor}
								onChange={(e) => {
									if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) {
										updateTheme({ accentColor: e.target.value });
									}
								}}
								placeholder="#9747ff"
								className="max-w-[120px] font-mono"
							/>
						</div>
					</div>

					{/* Border radius */}
					<div className="space-y-2">
						<Label htmlFor="border-radius">Border Radius</Label>
						<select
							id="border-radius"
							value={theme.borderRadius}
							onChange={(e) => updateTheme({ borderRadius: e.target.value })}
							className="w-full rounded-md border bg-background px-3 py-2 text-sm"
						>
							{BORDER_RADIUS_OPTIONS.map((opt) => (
								<option key={opt.value} value={opt.value}>{opt.label}</option>
							))}
						</select>
					</div>

					{/* Heading weight */}
					<div className="space-y-2">
						<Label htmlFor="heading-weight">Heading Weight</Label>
						<select
							id="heading-weight"
							value={theme.headingWeight}
							onChange={(e) => updateTheme({ headingWeight: e.target.value })}
							className="w-full rounded-md border bg-background px-3 py-2 text-sm"
						>
							{HEADING_WEIGHT_OPTIONS.map((opt) => (
								<option key={opt.value} value={opt.value}>{opt.label}</option>
							))}
						</select>
					</div>

					{/* Font family */}
					<div className="space-y-2">
						<Label htmlFor="font-family">Font Family</Label>
						<select
							id="font-family"
							value={theme.fontFamily}
							onChange={(e) => updateTheme({ fontFamily: e.target.value })}
							className="w-full rounded-md border bg-background px-3 py-2 text-sm"
						>
							{FONT_OPTIONS.map((opt) => (
								<option key={opt.value} value={opt.value}>{opt.label}</option>
							))}
						</select>
					</div>

					{/* Component variants */}
					<div className="space-y-4 border-t pt-4">
						<Label className="text-base font-semibold">Component Variants</Label>
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="hero-variant">Hero</Label>
								<select id="hero-variant" value={theme.heroVariant} onChange={(e) => updateTheme({ heroVariant: e.target.value as ThemeSettings["heroVariant"] })} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
									{HERO_VARIANTS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
								</select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="header-variant">Header</Label>
								<select id="header-variant" value={theme.headerVariant} onChange={(e) => updateTheme({ headerVariant: e.target.value as ThemeSettings["headerVariant"] })} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
									{HEADER_VARIANTS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
								</select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="footer-variant">Footer</Label>
								<select id="footer-variant" value={theme.footerVariant} onChange={(e) => updateTheme({ footerVariant: e.target.value as ThemeSettings["footerVariant"] })} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
									{FOOTER_VARIANTS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
								</select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="card-variant">Post Card</Label>
								<select id="card-variant" value={theme.postCardVariant} onChange={(e) => updateTheme({ postCardVariant: e.target.value as ThemeSettings["postCardVariant"] })} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
									{CARD_VARIANTS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
								</select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="cta-variant">CTA Section</Label>
								<select id="cta-variant" value={theme.ctaSectionVariant} onChange={(e) => updateTheme({ ctaSectionVariant: e.target.value as ThemeSettings["ctaSectionVariant"] })} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
									{CTA_VARIANTS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
								</select>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{message && (
				<p className={`text-sm ${isError ? "text-destructive" : "text-green-600"}`} role="status">
					{message}
				</p>
			)}

			<Button onClick={handleSave} disabled={isSaving}>
				{isSaving ? "Saving..." : "Save Settings"}
			</Button>
		</div>
	);
}
