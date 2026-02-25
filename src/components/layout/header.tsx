import Link from "next/link";
import { getSiteSettings } from "@/lib/site-settings";
import { headerLinks, headerCtaButtons } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { MobileNav } from "./mobile-nav";
import { SearchTrigger } from "./search-trigger";
import { ThemeToggle } from "./theme-toggle";
import { NavLinks } from "./nav-links";
import type { ThemeSettings } from "@/types/site-settings";

const headerVariantStyles: Record<ThemeSettings["headerVariant"], string> = {
	solid: "bg-background border-b border-border",
	blur: "bg-background/80 backdrop-blur-md border-b border-border/50 dark:bg-black/30 dark:border-white/10",
	transparent: "bg-transparent border-b border-transparent",
};

export async function Header() {
	const settings = await getSiteSettings();

	const filteredLinks = headerLinks.filter(
		(link) => !link.feature || settings.features[link.feature],
	);

	const filteredCtas = headerCtaButtons.filter(
		(btn) => !btn.feature || settings.features[btn.feature],
	);

	return (
		<header className={cn("fixed top-0 z-50 w-full", headerVariantStyles[settings.theme.headerVariant] ?? headerVariantStyles.blur)}>
			<div className="mx-auto flex h-14 max-w-[1440px] items-center px-4">
				<Link href="/" className="mr-3 text-lg font-semibold tracking-tight md:mr-6">
					{settings.name}
				</Link>

				<nav aria-label="Main navigation" className="hidden flex-1 justify-center md:flex">
					<NavLinks links={filteredLinks} />
				</nav>

				<div className="ml-auto flex items-center gap-1 md:ml-0">
					{settings.ui.search && <SearchTrigger />}
					{settings.ui.themeToggle && <ThemeToggle />}

					<div className="hidden items-center gap-2 md:flex">
						{filteredCtas.map((cta) => (
							<Link
								key={cta.href}
								href={cta.href}
								className={
									cta.variant === "primary"
										? "rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
										: "rounded-full border border-border px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
								}
							>
								{cta.label}
							</Link>
						))}
					</div>

					<MobileNav
						links={filteredLinks}
						ctaButtons={filteredCtas}
						showSearch={settings.ui.search}
						siteName={settings.name}
					/>
				</div>
			</div>
		</header>
	);
}
