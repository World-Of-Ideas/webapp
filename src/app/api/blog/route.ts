import { NextRequest } from "next/server";
import { siteConfig } from "@/config/site";
import { apiSuccess, apiError } from "@/lib/api";
import { getPublishedPosts } from "@/lib/blog";

export async function GET(request: NextRequest) {
	if (!siteConfig.features.blog) {
		return apiError("NOT_FOUND", "Blog is not available");
	}

	const page = Math.max(Number(request.nextUrl.searchParams.get("page") ?? "1"), 1);
	const limit = Math.min(Math.max(Number(request.nextUrl.searchParams.get("limit") ?? "12"), 1), 100);

	const { items, total } = await getPublishedPosts(page, limit);

	return apiSuccess({
		posts: items,
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
	});
}
