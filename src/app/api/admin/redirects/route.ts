import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api";
import { requireAdminSession } from "@/lib/admin-auth";
import { getAllRedirects, createRedirect } from "@/lib/redirects";
import { validateRedirectBody } from "@/lib/validation";

export async function GET() {
	if (!(await requireAdminSession())) {
		return apiError("UNAUTHORIZED", "Not authenticated");
	}

	const redirects = await getAllRedirects();
	return apiSuccess(redirects);
}

export async function POST(request: NextRequest) {
	if (!(await requireAdminSession())) {
		return apiError("UNAUTHORIZED", "Not authenticated");
	}

	try {
		const body = await request.json();
		const bodyError = validateRedirectBody(body);
		if (bodyError) return apiError("VALIDATION_ERROR", bodyError);
		const redirect = await createRedirect(body as Parameters<typeof createRedirect>[0]);
		return apiSuccess(redirect, 201);
	} catch (err) {
		if (err instanceof Error && err.message.includes("UNIQUE constraint failed")) {
			return apiError("VALIDATION_ERROR", "A redirect with this path already exists");
		}
		return apiError("INTERNAL_ERROR", "Failed to create redirect");
	}
}
