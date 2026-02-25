import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { getSiteSettings } from "@/lib/site-settings";
import { ReferralDashboard } from "@/components/waitlist/referral-dashboard";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
	const settings = await getSiteSettings();
	return {
		title: "Your Waitlist Position",
		description: `Track your waitlist position and share your referral link for ${settings.name}.`,
		openGraph: {
			title: "Your Waitlist Position",
			description: `Track your waitlist position and share your referral link for ${settings.name}.`,
			url: `${siteConfig.url}/waitlist`,
		},
		alternates: {
			canonical: `${siteConfig.url}/waitlist`,
		},
		robots: { index: false },
	};
}

export default async function ReferralPage({
	params,
}: {
	params: Promise<{ code: string }>;
}) {
	const settings = await getSiteSettings();
	if (!settings.features.waitlist) {
		notFound();
	}

	const { code } = await params;

	return (
		<>
			<Breadcrumbs
				items={[
					{ label: "Home", href: "/" },
					{ label: "Waitlist", href: "/waitlist" },
				]}
				currentPage="Your Position"
			/>

			<div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
				<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
					Your Waitlist Position
				</h1>

				<div className="mt-8">
					<ReferralDashboard code={code} />
				</div>
			</div>
		</>
	);
}
