import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api";
import { requireAdminSession } from "@/lib/admin-auth";
import { updatePost, deletePost } from "@/lib/blog";

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	if (!(await requireAdminSession())) {
		return apiError("UNAUTHORIZED", "Not authenticated");
	}

	try {
		const { id } = await params;
		const body = await request.json() as Parameters<typeof updatePost>[1];
		const post = await updatePost(Number(id), body);
		return apiSuccess(post);
	} catch {
		return apiError("INTERNAL_ERROR", "Failed to update post");
	}
}

export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	if (!(await requireAdminSession())) {
		return apiError("UNAUTHORIZED", "Not authenticated");
	}

	try {
		const { id } = await params;
		await deletePost(Number(id));
		return apiSuccess({ success: true });
	} catch {
		return apiError("INTERNAL_ERROR", "Failed to delete post");
	}
}
