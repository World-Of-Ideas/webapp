import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function NotFound() {
	const hasWaitlist = siteConfig.features.waitlist;
	const hasProductLinks =
		siteConfig.productLinks.appUrl ||
		siteConfig.productLinks.appStoreUrl ||
		siteConfig.productLinks.playStoreUrl;

	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
			<h1 className="text-4xl font-bold tracking-tight">Page Not Found</h1>
			<p className="mt-4 text-lg text-muted-foreground">
				Sorry, the page you are looking for does not exist or has been moved.
			</p>
			<div className="mt-8 flex items-center gap-4">
				{hasWaitlist ? (
					<Link
						href="/waitlist"
						className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
					>
						Join the Waitlist
					</Link>
				) : hasProductLinks ? (
					<>
						{siteConfig.productLinks.appUrl && (
							<a
								href={siteConfig.productLinks.appUrl}
								className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
							>
								Get Started
							</a>
						)}
						{siteConfig.productLinks.appStoreUrl && (
							<a
								href={siteConfig.productLinks.appStoreUrl}
								className="rounded-md border border-input px-6 py-3 text-sm font-semibold hover:bg-accent"
							>
								App Store
							</a>
						)}
						{siteConfig.productLinks.playStoreUrl && (
							<a
								href={siteConfig.productLinks.playStoreUrl}
								className="rounded-md border border-input px-6 py-3 text-sm font-semibold hover:bg-accent"
							>
								Play Store
							</a>
						)}
					</>
				) : (
					<Link
						href="/"
						className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
					>
						Go Home
					</Link>
				)}
			</div>
		</div>
	);
}
