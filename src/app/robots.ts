import type { MetadataRoute } from "next";
import { getEnv } from "@/db";
import { siteConfig } from "@/config/site";

export default async function robots(): Promise<MetadataRoute.Robots> {
	const env = await getEnv();
	const environment = (env as unknown as Record<string, string>).ENVIRONMENT ?? "uat";
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
