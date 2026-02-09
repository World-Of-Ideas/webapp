import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api";
import { requireAdminSession } from "@/lib/admin-auth";
import { getAllPages, createPage, isReservedSlug } from "@/lib/pages";

export async function GET() {
	if (!(await requireAdminSession())) {
		return apiError("UNAUTHORIZED", "Not authenticated");
	}

	const pages = await getAllPages();
	return apiSuccess(pages);
}

export async function POST(request: NextRequest) {
	if (!(await requireAdminSession())) {
		return apiError("UNAUTHORIZED", "Not authenticated");
	}

	try {
		const body = await request.json() as Parameters<typeof createPage>[0];
		const { slug } = body;

		if (!slug) {
			return apiError("VALIDATION_ERROR", "Slug is required");
		}

		if (isReservedSlug(slug)) {
			return apiError("VALIDATION_ERROR", `Slug "${slug}" is reserved`);
		}

		const page = await createPage(body);
		return apiSuccess(page, 201);
	} catch {
		return apiError("INTERNAL_ERROR", "Failed to create page");
	}
}
