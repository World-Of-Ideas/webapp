import { getEnv } from "@/db";

/**
 * Verify a Bearer token from the Authorization header against the API_KEY secret.
 * Uses HMAC comparison to prevent timing attacks without leaking key length.
 */
export async function requireApiKey(request: Request): Promise<boolean> {
	const header = request.headers.get("authorization");
	if (!header || !header.startsWith("Bearer ")) return false;

	const token = header.slice(7);
	if (token.length < 16 || token.length > 512) return false;

	const env = await getEnv();
	const apiKey = (env as unknown as Record<string, string | undefined>).API_KEY;
	if (!apiKey) return false;

	// HMAC both values with a fixed key — the resulting MACs are always the same
	// length regardless of input, so timingSafeEqual never leaks length information.
	const encoder = new TextEncoder();
	const hmacKey = await crypto.subtle.importKey(
		"raw",
		encoder.encode("api-key-compare"),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);

	const [macA, macB] = await Promise.all([
		crypto.subtle.sign("HMAC", hmacKey, encoder.encode(token)),
		crypto.subtle.sign("HMAC", hmacKey, encoder.encode(apiKey)),
	]);

	return (crypto.subtle as unknown as { timingSafeEqual(a: ArrayBufferView, b: ArrayBufferView): boolean })
		.timingSafeEqual(new Uint8Array(macA), new Uint8Array(macB));
}
