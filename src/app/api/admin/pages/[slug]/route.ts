import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api";
import { requireAdminSession } from "@/lib/admin-auth";
import { updatePage, deletePage, isSystemPage } from "@/lib/pages";

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ slug: string }> },
) {
	if (!(await requireAdminSession())) {
		return apiError("UNAUTHORIZED", "Not authenticated");
	}

	try {
		const { slug } = await params;
		const body = await request.json() as Parameters<typeof updatePage>[1];
		const page = await updatePage(slug, body);
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
