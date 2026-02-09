import type { ContentBlock } from "@/types/content";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";

interface CtaBlockProps {
	block: ContentBlock;
}

export function CtaBlock({ block }: CtaBlockProps) {
	const text = block.text ?? "Get started today!";

	// Adaptive CTA: waitlist form (pre-launch) or product links (post-launch)
	if (siteConfig.features.waitlist) {
		return (
			<div className="not-prose my-8 rounded-lg border bg-muted/50 p-6 text-center">
				<p className="mb-4 text-lg font-medium">{text}</p>
				<Button asChild>
					<Link href="/waitlist">Join the Waitlist</Link>
				</Button>
			</div>
		);
	}

	// Post-launch: show product links
	const { appUrl, appStoreUrl, playStoreUrl } = siteConfig.productLinks;
	const hasLinks = appUrl || appStoreUrl || playStoreUrl;

	if (!hasLinks) return null;

	return (
		<div className="not-prose my-8 rounded-lg border bg-muted/50 p-6 text-center">
			<p className="mb-4 text-lg font-medium">{text}</p>
			<div className="flex flex-wrap justify-center gap-3">
				{appUrl && (
					<Button asChild>
						<Link href={appUrl}>Try {siteConfig.name}</Link>
					</Button>
				)}
				{appStoreUrl && (
					<Button variant="outline" asChild>
						<Link href={appStoreUrl}>App Store</Link>
					</Button>
				)}
				{playStoreUrl && (
					<Button variant="outline" asChild>
						<Link href={playStoreUrl}>Google Play</Link>
					</Button>
				)}
			</div>
		</div>
	);
}
