import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";

// Polyfill timingSafeEqual for Node.js test environment (Workers-only API)
beforeAll(() => {
	if (!(crypto.subtle as unknown as Record<string, unknown>).timingSafeEqual) {
		(crypto.subtle as unknown as Record<string, unknown>).timingSafeEqual = (a: ArrayBufferView, b: ArrayBufferView): boolean => {
			const bufA = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
			const bufB = new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
			if (bufA.length !== bufB.length) return false;
			let result = 0;
			for (let i = 0; i < bufA.length; i++) result |= bufA[i] ^ bufB[i];
			return result === 0;
		};
	}
});

const { mockGetEnv } = vi.hoisted(() => {
	const mockGetEnv = vi.fn() as ReturnType<typeof vi.fn>;
	return { mockGetEnv };
});

vi.mock("@/db", () => ({
	getEnv: mockGetEnv,
}));

import { requireApiKey } from "../api-auth";

function makeRequest(authorization?: string): Request {
	const headers = new Headers();
	if (authorization) headers.set("authorization", authorization);
	return new Request("https://example.com/api/blog", { headers });
}

describe("requireApiKey", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetEnv.mockResolvedValue({ API_KEY: "test-api-key-that-is-long-enough" });
	});

	it("returns false when no Authorization header", async () => {
		expect(await requireApiKey(makeRequest())).toBe(false);
	});

	it("returns false when Authorization header is not Bearer", async () => {
		expect(await requireApiKey(makeRequest("Basic abc123"))).toBe(false);
	});

	it("returns false when token is too short", async () => {
		expect(await requireApiKey(makeRequest("Bearer short"))).toBe(false);
	});

	it("returns false when API_KEY is not configured", async () => {
		mockGetEnv.mockResolvedValue({});
		expect(await requireApiKey(makeRequest("Bearer some-long-enough-token"))).toBe(false);
	});

	it("returns false when token does not match", async () => {
		expect(await requireApiKey(makeRequest("Bearer wrong-key-that-is-long-enough"))).toBe(false);
	});

	it("returns false when token length differs from API_KEY", async () => {
		expect(await requireApiKey(makeRequest("Bearer different-length-key"))).toBe(false);
	});

	it("returns true when token matches API_KEY", async () => {
		expect(await requireApiKey(makeRequest("Bearer test-api-key-that-is-long-enough"))).toBe(true);
	});
});
