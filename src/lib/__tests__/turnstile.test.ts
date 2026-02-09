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
			json: () => Promise.resolve({ success: true }),
		});

		const result = await verifyTurnstileToken("valid-token", "secret");
		expect(result).toBe(true);
	});

	it("returns false when API returns success: false", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			json: () => Promise.resolve({ success: false }),
		});

		const result = await verifyTurnstileToken("invalid-token", "secret");
		expect(result).toBe(false);
	});

	it("passes correct parameters to the API", async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			json: () => Promise.resolve({ success: true }),
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
