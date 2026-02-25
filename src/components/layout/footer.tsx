import Link from "next/link";
import { getSiteSettings } from "@/lib/site-settings";
import { footerGroups } from "@/config/navigation";
import { getPublishedContentPages, isSystemPage } from "@/lib/pages";
import { getTrackingSettings } from "@/lib/tracking";
import { CookiePreferencesButton } from "@/components/shared/cookie-preferences-button";
import { TwitterIcon, GitHubIcon, DiscordIcon, InstagramIcon } from "./social-icons";
import { cn } from "@/lib/utils";
import type { ThemeSettings } from "@/types/site-settings";

const footerVariantStyles: Record<ThemeSettings["footerVariant"], string> = {
	simple: "border-t bg-muted/50 dark:bg-zinc-950",
	columns: "border-t bg-muted/30 dark:bg-zinc-900",
	dark: "bg-zinc-950 text-zinc-100 dark",
};

export async function Footer() {
	const [contentPages, trackingSettings, settings] = await Promise.all([
		getPublishedContentPages().then((pages) => pages.filter((p) => !isSystemPage(p.slug))),
		getTrackingSettings(),
		getSiteSettings(),
	]);
	return (
		<footer className={cn(footerVariantStyles[settings.theme.footerVariant] ?? footerVariantStyles.simple)}>
			<div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6">
				<div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
					<div>
						<Link href="/" className="text-lg font-semibold">
							{settings.name}
						</Link>
						<p className="mt-2 text-sm text-muted-foreground">
							{settings.description}
						</p>
						<div className="mt-4 flex gap-3">
							{settings.social.twitter && (
								<Link
									href={`https://twitter.com/${settings.social.twitter.replace("@", "")}`}
									className="text-muted-foreground transition-colors hover:text-foreground"
									target="_blank"
									rel="noopener noreferrer"
								>
									<span className="sr-only">Twitter</span>
									<TwitterIcon />
								</Link>
							)}
							{settings.social.github && (
								<Link
									href={settings.social.github}
									className="text-muted-foreground transition-colors hover:text-foreground"
									target="_blank"
									rel="noopener noreferrer"
								>
									<span className="sr-only">GitHub</span>
									<GitHubIcon />
								</Link>
							)}
							{settings.social.discord && (
								<Link
									href={settings.social.discord}
									className="text-muted-foreground transition-colors hover:text-foreground"
									target="_blank"
									rel="noopener noreferrer"
								>
									<span className="sr-only">Discord</span>
									<DiscordIcon />
								</Link>
							)}
							{settings.social.instagram && (
								<Link
									href={settings.social.instagram}
									className="text-muted-foreground transition-colors hover:text-foreground"
									target="_blank"
									rel="noopener noreferrer"
								>
									<span className="sr-only">Instagram</span>
									<InstagramIcon />
								</Link>
							)}
						</div>
					</div>

					<nav aria-label="Footer navigation" className="col-span-1 grid gap-8 sm:col-span-1 md:col-span-3 md:grid-cols-3">
					{footerGroups.map((group) => {
						const filteredLinks = group.links.filter(
							(link) => !link.feature || settings.features[link.feature],
						);
						if (filteredLinks.length === 0) return null;

						return (
							<div key={group.title}>
								<h3 className="mb-3 text-sm font-semibold">{group.title}</h3>
								<ul className="space-y-2">
									{filteredLinks.map((link) => (
										<li key={link.href}>
											<Link
												href={link.href}
												className="text-sm text-muted-foreground transition-colors hover:text-foreground"
											>
												{link.label}
											</Link>
										</li>
									))}
								</ul>
							</div>
						);
					})}

					{contentPages.length > 0 && (
						<div>
							<h3 className="mb-3 text-sm font-semibold">Pages</h3>
							<ul className="space-y-2">
								{contentPages.map((page) => (
									<li key={page.slug}>
										<Link
											href={`/${page.slug}`}
											className="text-sm text-muted-foreground transition-colors hover:text-foreground"
										>
											{page.title}
										</Link>
									</li>
								))}
							</ul>
						</div>
					)}
				</nav>
				</div>

				<div className="mt-8 flex flex-col items-center gap-2 border-t border-border/50 pt-8 text-center text-sm text-muted-foreground">
					<span>&copy; {new Date().getFullYear()} {settings.name}. All rights reserved.</span>
					{trackingSettings?.cookieConsentEnabled && <CookiePreferencesButton />}
				</div>
			</div>
		</footer>
	);
}
