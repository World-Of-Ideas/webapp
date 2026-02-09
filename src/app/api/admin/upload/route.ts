import { NextRequest } from "next/server";
import { getEnv } from "@/db";
import { apiSuccess, apiError } from "@/lib/api";
import { requireAdminSession } from "@/lib/admin-auth";
import { validateUpload, uploadToR2, getPublicUrl } from "@/lib/r2";

export async function POST(request: NextRequest) {
	if (!(await requireAdminSession())) {
		return apiError("UNAUTHORIZED", "Not authenticated");
	}

	try {
		const formData = await request.formData();
		const file = formData.get("file") as File | null;
		const path = formData.get("path") as string | null;

		if (!file) {
			return apiError("VALIDATION_ERROR", "File is required");
		}

		const validationError = validateUpload(file);
		if (validationError) {
			return apiError("VALIDATION_ERROR", validationError);
		}

		const key = path ?? `uploads/${crypto.randomUUID()}/${file.name}`;
		const env = await getEnv();

		await uploadToR2(env.ASSETS_BUCKET, key, file);
		const url = getPublicUrl(env.R2_PUBLIC_URL, key);

		return apiSuccess({ url, key }, 201);
	} catch {
		return apiError("INTERNAL_ERROR", "Failed to upload file");
	}
}
