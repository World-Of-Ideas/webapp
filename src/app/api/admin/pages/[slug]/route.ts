import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api";
import { requireAdminSession } from "@/lib/admin-auth";
import { updatePage, deletePage, isSystemPage } from "@/lib/pages";
import { validatePageBody } from "@/lib/validation";

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ slug: string }> },
) {
	if (!(await requireAdminSession())) {
		return apiError("UNAUTHORIZED", "Not authenticated");
	}

	try {
		const { slug } = await params;
		const body = await request.json();
		const bodyError = validatePageBody(body, false);
		if (bodyError) return apiError("VALIDATION_ERROR", bodyError);
		// Strip slug from body — slug is the PK and must not be changed via update
		const { slug: _ignoredSlug, ...safeBody } = body as Record<string, unknown>;
		const page = await updatePage(slug, safeBody as Parameters<typeof updatePage>[1]);
		return apiSuccess(page);
	} catch {
		return apiError("INTERNAL_ERROR", "Failed to update page");
	}
}

export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ slug: string }> },
) {
	if (!(await requireAdminSession())) {
		return apiError("UNAUTHORIZED", "Not authenticated");
	}

	try {
		const { slug } = await params;

		if (isSystemPage(slug)) {
			return apiError("VALIDATION_ERROR", "System pages cannot be deleted");
		}

		await deletePage(slug);
		return apiSuccess({ success: true });
	} catch {
		return apiError("INTERNAL_ERROR", "Failed to delete page");
	}
}
