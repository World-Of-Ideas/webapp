import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { getSiteSettings } from "@/lib/site-settings";
import { getPageBySlug } from "@/lib/pages";
import { ContentRenderer } from "@/components/content/content-renderer";
import { NewsletterForm } from "@/components/newsletter/signup-form";
import { FaqSection } from "@/components/layout/faq-section";
import { RelatedPages } from "@/components/layout/related-pages";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/shared/json-ld";
import type { FAQ, RelatedPage } from "@/types/content";

export async function generateMetadata(): Promise<Metadata> {
	const settings = await getSiteSettings();
	return {
		title: "Subscribe to Our Newsletter",
		description: `Stay updated with the latest news and updates from ${settings.name}.`,
		openGraph: {
			title: "Subscribe to Our Newsletter",
			description: `Stay updated with the latest news and updates from ${settings.name}.`,
			url: `${siteConfig.url}/newsletter`,
		},
		alternates: {
			canonical: `${siteConfig.url}/newsletter`,
		},
	};
}

export default async function NewsletterPage() {
	const settings = await getSiteSettings();
	if (!settings.features.newsletter) {
		notFound();
	}

	const page = await getPageBySlug("newsletter");

	const faqs = (page?.faqs ?? []) as FAQ[];
	const relatedPages = (page?.relatedPages ?? []) as RelatedPage[];

	return (
		<>
			<JsonLd
				data={{
					"@context": "https://schema.org",
					"@type": "WebPage",
					name: `Subscribe to Our Newsletter | ${settings.name}`,
					url: `${siteConfig.url}/newsletter`,
				}}
			/>

			<Breadcrumbs
				items={[
					{ label: "Home", href: "/" },
				]}
				currentPage="Newsletter"
			/>

			<div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
				<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
					Subscribe to Our Newsletter
				</h1>

				{page?.content && (
					<div className="mt-8">
						<ContentRenderer blocks={page.content} features={settings.features} />
					</div>
				)}

				<div className="mt-8">
					<NewsletterForm />
				</div>
			</div>

			{faqs.length > 0 && <FaqSection faqs={faqs} />}
			{relatedPages.length > 0 && <RelatedPages pages={relatedPages} features={settings.features} />}
		</>
	);
}
