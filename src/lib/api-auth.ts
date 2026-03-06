import { getEnv } from "@/db";

/**
 * Verify a Bearer token from the Authorization header against the API_KEY secret.
 * Uses constant-time comparison to prevent timing attacks.
 */
export async function requireApiKey(request: Request): Promise<boolean> {
	const header = request.headers.get("authorization");
	if (!header || !header.startsWith("Bearer ")) return false;

	const token = header.slice(7);
	if (token.length < 16) return false;

	const env = await getEnv();
	const apiKey = (env as unknown as Record<string, string | undefined>).API_KEY;
	if (!apiKey) return false;

	const encoder = new TextEncoder();
	const a = encoder.encode(token);
	const b = encoder.encode(apiKey);

	if (a.byteLength !== b.byteLength) return false;

	// timingSafeEqual is available on Cloudflare Workers runtime
	return (crypto.subtle as unknown as { timingSafeEqual(a: ArrayBufferView, b: ArrayBufferView): boolean }).timingSafeEqual(a, b);
}
