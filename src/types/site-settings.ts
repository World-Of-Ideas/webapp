export interface AnnouncementSettings {
	enabled: boolean;
	text: string;
	linkUrl: string;
	linkText: string;
}

export interface SiteSettings {
	name: string;
	description: string;
	author: string;
	social: { twitter: string; github: string; discord: string; instagram: string };
	productLinks: { appUrl: string; appStoreUrl: string; playStoreUrl: string };
	features: Record<string, boolean>;
	ui: Record<string, boolean>;
	theme: ThemeSettings;
	logoUrl: string | null;
	announcement: AnnouncementSettings;
}

export interface ThemeSettings {
	preset: string;
	accentColor: string;
	borderRadius: string;
	headingWeight: string;
	fontFamily: string;
	heroVariant: "centered" | "gradient" | "split";
	headerVariant: "solid" | "blur" | "transparent";
	footerVariant: "simple" | "columns" | "dark";
	postCardVariant: "bordered" | "filled" | "minimal";
	ctaSectionVariant: "gradient" | "solid" | "outlined";
}
