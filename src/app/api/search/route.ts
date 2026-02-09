import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api";
import { search } from "@/lib/search";

export async function GET(request: NextRequest) {
	const q = request.nextUrl.searchParams.get("q") ?? "";

	if (q.length < 2) {
		return apiError("VALIDATION_ERROR", "Query must be at least 2 characters");
	}

	const results = await search(q);

	return apiSuccess(results);
}
