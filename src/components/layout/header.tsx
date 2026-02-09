import Link from "next/link";
import { Search } from "lucide-react";
import { siteConfig } from "@/config/site";
import { headerLinks } from "@/config/navigation";
import { Button } from "@/components/ui/button";
import { MobileNav } from "./mobile-nav";

export function Header() {
	const filteredLinks = headerLinks.filter(
		(link) => !link.feature || siteConfig.features[link.feature],
	);

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto flex h-14 items-center px-4">
				<Link href="/" className="mr-6 font-bold">
					{siteConfig.name}
				</Link>

				<nav className="hidden md:flex md:gap-6">
					{filteredLinks.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
						>
							{link.label}
						</Link>
					))}
				</nav>

				<div className="ml-auto flex items-center gap-2">
					<Button variant="ghost" size="icon" className="hidden md:flex" aria-label="Search">
						<Search className="h-4 w-4" />
						<span className="sr-only">Search (⌘K)</span>
					</Button>
					<MobileNav links={filteredLinks} />
				</div>
			</div>
		</header>
	);
}
