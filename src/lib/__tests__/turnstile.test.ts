import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { verifyTurnstileToken } from "../turnstile";

describe("verifyTurnstileToken", () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		vi.restoreAllMocks();
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	it("returns true when API returns success: true", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ success: true, challenge_ts: new Date().toISOString() }),
		});

		const result = await verifyTurnstileToken("valid-token", "secret");
		expect(result).toBe(true);
	});

	it("returns false when API returns success: false", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ success: false }),
		});

		const result = await verifyTurnstileToken("invalid-token", "secret");
		expect(result).toBe(false);
	});

	it("returns false when API response is not ok", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: false,
		});

		const result = await verifyTurnstileToken("token", "secret");
		expect(result).toBe(false);
	});

	it("returns false for empty or oversized tokens", async () => {
		expect(await verifyTurnstileToken("", "secret")).toBe(false);
		expect(await verifyTurnstileToken("x".repeat(2049), "secret")).toBe(false);
	});

	it("returns false for stale challenges", async () => {
		const staleTs = new Date(Date.now() - 10 * 60 * 1000).toISOString(); // 10 min ago
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ success: true, challenge_ts: staleTs }),
		});

		const result = await verifyTurnstileToken("token", "secret");
		expect(result).toBe(false);
	});

	it("passes correct parameters to the API", async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ success: true, challenge_ts: new Date().toISOString() }),
		});
		globalThis.fetch = mockFetch;

		await verifyTurnstileToken("my-token", "my-secret");

		expect(mockFetch).toHaveBeenCalledWith(
			"https://challenges.cloudflare.com/turnstile/v0/siteverify",
			expect.objectContaining({
				method: "POST",
				body: expect.any(URLSearchParams),
			}),
		);

		const body = mockFetch.mock.calls[0][1].body as URLSearchParams;
		expect(body.get("secret")).toBe("my-secret");
		expect(body.get("response")).toBe("my-token");
	});
});
