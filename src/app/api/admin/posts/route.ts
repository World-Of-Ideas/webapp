import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api";
import { requireAdminSession } from "@/lib/admin-auth";
import { getAllPosts, createPost } from "@/lib/blog";

export async function GET() {
	if (!(await requireAdminSession())) {
		return apiError("UNAUTHORIZED", "Not authenticated");
	}

	const posts = await getAllPosts();
	return apiSuccess(posts);
}

export async function POST(request: NextRequest) {
	if (!(await requireAdminSession())) {
		return apiError("UNAUTHORIZED", "Not authenticated");
	}

	try {
		const body = await request.json() as Parameters<typeof createPost>[0];
		const post = await createPost(body);
		return apiSuccess(post, 201);
	} catch {
		return apiError("INTERNAL_ERROR", "Failed to create post");
	}
}
