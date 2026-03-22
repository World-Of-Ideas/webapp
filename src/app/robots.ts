import type { MetadataRoute } from "next";
import { getEnv } from "@/db";
import { siteConfig } from "@/config/site";

export default async function robots(): Promise<MetadataRoute.Robots> {
	let environment = "uat";
	try {
		const env = await getEnv();
		environment = (env as unknown as Record<string, string>).ENVIRONMENT ?? "uat";
	} catch {
		// Dev/test environment — default to UAT (block indexing)
	}
	const baseUrl = siteConfig.url;

	if (environment === "uat") {
		return {
			rules: [
				{
					userAgent: "*",
					disallow: "/",
				},
			],
		};
	}

	// Production
	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
				disallow: "/admin",
			},
		],
		sitemap: `${baseUrl}/sitemap.xml`,
		host: baseUrl,
	};
}
