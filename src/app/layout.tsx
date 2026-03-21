import type { Metadata } from "next";
import { Inter, JetBrains_Mono, DM_Sans, Space_Grotesk } from "next/font/google";
import { Geist } from "next/font/google";
import { siteConfig } from "@/config/site";
import { getSiteSettings } from "@/lib/site-settings";
import { hexToOklch, hexToOklchLight } from "@/lib/color";
import { ThemeProvider } from "@/components/shared/theme-provider";
import "./globals.css";

// D1 database is only available at runtime via Cloudflare bindings.
// Force all pages to SSR at request time to avoid SQLITE_BUSY during prerendering.
export const dynamic = "force-dynamic";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700"],
});

const geistSans = Geist({
	variable: "--font-geist",
	subsets: ["latin"],
});

const dmSans = DM_Sans({
	variable: "--font-dm-sans",
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
	variable: "--font-space-grotesk",
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
	variable: "--font-mono",
	subsets: ["latin"],
	weight: ["400", "500"],
});

const fontVarMap: Record<string, string> = {
	inter: "var(--font-inter)",
	geist: "var(--font-geist)",
	"dm-sans": "var(--font-dm-sans)",
	"space-grotesk": "var(--font-space-grotesk)",
};

export async function generateMetadata(): Promise<Metadata> {
	const settings = await getSiteSettings();

	return {
		metadataBase: new URL(siteConfig.url),
		title: {
			default: settings.name,
			template: `%s | ${settings.name}`,
		},
		description: settings.description,
		authors: [{ name: settings.author }],
		creator: settings.author,
		formatDetection: {
			email: false,
			address: false,
			telephone: false,
		},
		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
				"max-image-preview": "large",
				"max-snippet": -1,
			},
		},
		openGraph: {
			type: "website",
			siteName: settings.name,
			title: settings.name,
			description: settings.description,
			locale: "en_US",
			images: [{ url: "/og-default.png", width: 1200, height: 630, alt: settings.name }],
		},
		twitter: {
			card: "summary_large_image",
			title: settings.name,
			description: settings.description,
			images: [{ url: "/og-default.png", alt: settings.name }],
			...(settings.social.twitter && { site: settings.social.twitter }),
			...(settings.social.twitter && { creator: settings.social.twitter }),
		},
		alternates: {
			types: {
				"application/rss+xml": "/feed.xml",
			},
		},
	};
}

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const { theme } = await getSiteSettings();

	const primaryOklch = hexToOklch(theme.accentColor);
	const primaryLightOklch = hexToOklchLight(theme.accentColor);
	const activeFontFamily = fontVarMap[theme.fontFamily] || fontVarMap.inter;

	return (
		<html
			lang="en"
			suppressHydrationWarning
			style={{
				"--primary": primaryOklch,
				"--primary-light": primaryLightOklch,
				"--ring": primaryOklch,
				"--radius": theme.borderRadius,
				"--heading-weight": theme.headingWeight,
			} as React.CSSProperties}
		>
			<body
				className={`${inter.variable} ${geistSans.variable} ${dmSans.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}
				style={{ fontFamily: activeFontFamily } as React.CSSProperties}
			>
				<ThemeProvider>{children}</ThemeProvider>
			</body>
		</html>
	);
}
