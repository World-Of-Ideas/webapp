import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api";
import { getSiteSettingsDirect } from "@/lib/site-settings";
import { getPublishedPostBySlug, getPostBySlug, updatePost, deletePost } from "@/lib/blog";
import { requireApiKey } from "@/lib/api-auth";
import { validatePostUpdateBody } from "@/lib/validation";

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

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ slug: string }> },
) {
	if (!(await getSiteSettingsDirect()).features.api) {
		return apiError("NOT_FOUND", "API access is not enabled");
	}
	if (!(await requireApiKey(request))) {
		return apiError("UNAUTHORIZED", "Invalid or missing API key");
	}

	try {
		const { slug } = await params;
		const existing = await getPostBySlug(slug);
		if (!existing) return apiError("NOT_FOUND", "Post not found");

		const body = await request.json();
		const bodyError = validatePostUpdateBody(body);
		if (bodyError) return apiError("VALIDATION_ERROR", bodyError);

		try {
			const post = await updatePost(existing.id, body as Parameters<typeof updatePost>[1]);
			return apiSuccess(post);
		} catch (err) {
			if (err instanceof Error && err.message.includes("UNIQUE constraint failed")) {
				return apiError("VALIDATION_ERROR", "A post with this slug already exists");
			}
			throw err;
		}
	} catch {
		return apiError("INTERNAL_ERROR", "Failed to update post");
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ slug: string }> },
) {
	if (!(await getSiteSettingsDirect()).features.api) {
		return apiError("NOT_FOUND", "API access is not enabled");
	}
	if (!(await requireApiKey(request))) {
		return apiError("UNAUTHORIZED", "Invalid or missing API key");
	}

	try {
		const { slug } = await params;
		const existing = await getPostBySlug(slug);
		if (!existing) return apiError("NOT_FOUND", "Post not found");

		const deletedSlug = await deletePost(existing.id);

		// Clean up R2 assets (fire-and-forget)
		if (deletedSlug) {
			try {
				const { getEnv } = await import("@/db");
				const env = await getEnv();
				const bucket = (env as unknown as Record<string, unknown>).ASSETS_BUCKET as R2Bucket;
				const listed = await bucket.list({ prefix: `blog/${deletedSlug}/` });
				if (listed.objects.length > 0) {
					await bucket.delete(listed.objects.map((o) => o.key));
				}
			} catch {
				// R2 cleanup is best-effort
			}
		}

		return apiSuccess({ success: true });
	} catch {
		return apiError("INTERNAL_ERROR", "Failed to delete post");
	}
}
