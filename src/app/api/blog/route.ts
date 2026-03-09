import { NextRequest } from "next/server";
import { apiSuccess, apiError, clampInt, getClientIp } from "@/lib/api";
import { getSiteSettingsDirect } from "@/lib/site-settings";
import { getPublishedPosts, createPost } from "@/lib/blog";
import { requireApiKey } from "@/lib/api-auth";
import { validatePostBody } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
	if (!(await getSiteSettingsDirect()).features.blog) {
		return apiError("NOT_FOUND", "Blog is not available");
	}

	const ip = getClientIp(request);
	if (!checkRateLimit(`blog-list:${ip}`, 60, 60_000)) {
		return apiError("RATE_LIMITED", "Too many requests");
	}

	const page = clampInt(request.nextUrl.searchParams.get("page"), 1, 1, 10000);
	const limit = clampInt(request.nextUrl.searchParams.get("limit"), 12, 1, 100);

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

export async function POST(request: NextRequest) {
	if (!(await getSiteSettingsDirect()).features.api) {
		return apiError("NOT_FOUND", "API access is not enabled");
	}
	if (!(await requireApiKey(request))) {
		return apiError("UNAUTHORIZED", "Invalid or missing API key");
	}

	try {
		const body = await request.json();
		const bodyError = validatePostBody(body);
		if (bodyError) return apiError("VALIDATION_ERROR", bodyError);
		try {
			const post = await createPost(body as Parameters<typeof createPost>[0]);
			return apiSuccess(post, 201);
		} catch (err) {
			if (err instanceof Error && err.message.includes("UNIQUE constraint failed")) {
				return apiError("VALIDATION_ERROR", "A post with this slug already exists");
			}
			throw err;
		}
	} catch {
		return apiError("INTERNAL_ERROR", "Failed to create post");
	}
}
