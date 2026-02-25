import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api";
import { getSiteSettingsDirect } from "@/lib/site-settings";
import { getPublishedPostBySlug } from "@/lib/blog";

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ slug: string }> },
) {
	if (!(await getSiteSettingsDirect()).features.blog) {
		return apiError("NOT_FOUND", "Blog is not available");
	}

	const { slug } = await params;
	const post = await getPublishedPostBySlug(slug);

	if (!post) {
		return apiError("NOT_FOUND", "Post not found");
	}

	return apiSuccess(post);
}
