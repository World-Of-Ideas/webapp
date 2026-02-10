import { getEnv } from "@/db";

const ALLOWED_PREFIXES = ["blog/", "uploads/", "og/"];

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ key: string[] }> },
) {
	const { key: segments } = await params;
	const key = segments.join("/");

	// Validate path: must start with an allowed prefix and not contain traversal
	if (key.includes("..") || !ALLOWED_PREFIXES.some((p) => key.startsWith(p))) {
		return new Response("Not Found", { status: 404 });
	}

	const env = await getEnv();
	const bucket = (env as unknown as Record<string, unknown>)
		.ASSETS_BUCKET as R2Bucket;
	const object = await bucket.get(key);

	if (!object) {
		return new Response("Not Found", { status: 404 });
	}

	return new Response(object.body as ReadableStream, {
		headers: {
			"Content-Type":
				object.httpMetadata?.contentType ?? "application/octet-stream",
			"Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
		},
	});
}
