import Link from "next/link";
import { getSiteSettings } from "@/lib/site-settings";
import { getSubscriberMode } from "@/lib/subscriber-mode";

export default async function NotFound() {
	const settings = await getSiteSettings();
	const mode = getSubscriberMode(settings.features);
	const hasProductLinks =
		settings.productLinks.appUrl ||
		settings.productLinks.appStoreUrl ||
		settings.productLinks.playStoreUrl;

	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
			<h1 className="text-4xl font-bold tracking-tight">Page Not Found</h1>
			<p className="mt-4 text-lg text-muted-foreground">
				Sorry, the page you are looking for does not exist or has been moved.
			</p>
			<div className="mt-8 flex items-center gap-4">
				{mode === "waitlist" ? (
					<Link
						href="/waitlist"
						className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
					>
						Join the Waitlist
					</Link>
				) : mode === "newsletter" ? (
					<Link
						href="/newsletter"
						className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
					>
						Subscribe to Newsletter
					</Link>
				) : hasProductLinks ? (
					<>
						{settings.productLinks.appUrl && (
							<a
								href={settings.productLinks.appUrl}
								className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
							>
								Get Started
							</a>
						)}
						{settings.productLinks.appStoreUrl && (
							<a
								href={settings.productLinks.appStoreUrl}
								className="rounded-md border border-input px-6 py-3 text-sm font-semibold hover:bg-accent"
							>
								App Store
							</a>
						)}
						{settings.productLinks.playStoreUrl && (
							<a
								href={settings.productLinks.playStoreUrl}
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
