import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api";
import { requireAdminSession } from "@/lib/admin-auth";
import { updateRedirect, deleteRedirect } from "@/lib/redirects";
import { validateRedirectUpdateBody } from "@/lib/validation";

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	if (!(await requireAdminSession())) {
		return apiError("UNAUTHORIZED", "Not authenticated");
	}

	try {
		const { id } = await params;
		const numId = Number(id);
		if (!Number.isInteger(numId) || numId <= 0) return apiError("VALIDATION_ERROR", "Invalid redirect ID");
		const body = await request.json();
		const bodyError = validateRedirectUpdateBody(body);
		if (bodyError) return apiError("VALIDATION_ERROR", bodyError);
		try {
			const redirect = await updateRedirect(numId, body as Parameters<typeof updateRedirect>[1]);
			if (!redirect) return apiError("NOT_FOUND", "Redirect not found");
			return apiSuccess(redirect);
		} catch (err) {
			if (err instanceof Error && err.message.includes("UNIQUE constraint failed")) {
				return apiError("VALIDATION_ERROR", "A redirect with this path already exists");
			}
			throw err;
		}
	} catch {
		return apiError("INTERNAL_ERROR", "Failed to update redirect");
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
		const numId = Number(id);
		if (!Number.isInteger(numId) || numId <= 0) return apiError("VALIDATION_ERROR", "Invalid redirect ID");
		await deleteRedirect(numId);
		return apiSuccess({ success: true });
	} catch {
		return apiError("INTERNAL_ERROR", "Failed to delete redirect");
	}
}
