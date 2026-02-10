import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("checkRateLimit", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		// Reset the module so the internal store and lastCleanup are fresh
		vi.resetModules();
	});

	async function getCheckRateLimit() {
		const mod = await import("../rate-limit");
		return mod.checkRateLimit;
	}

	it("allows requests under the limit", async () => {
		const checkRateLimit = await getCheckRateLimit();
		const key = "test:under-limit";

		expect(checkRateLimit(key, 5, 60_000)).toBe(true);
		expect(checkRateLimit(key, 5, 60_000)).toBe(true);
		expect(checkRateLimit(key, 5, 60_000)).toBe(true);
	});

	it("allows requests up to exactly the limit", async () => {
		const checkRateLimit = await getCheckRateLimit();
		const key = "test:exact-limit";

		for (let i = 0; i < 3; i++) {
			expect(checkRateLimit(key, 3, 60_000)).toBe(true);
		}
	});

	it("blocks requests over the limit", async () => {
		const checkRateLimit = await getCheckRateLimit();
		const key = "test:over-limit";

		// Use up the 3 allowed requests
		expect(checkRateLimit(key, 3, 60_000)).toBe(true);
		expect(checkRateLimit(key, 3, 60_000)).toBe(true);
		expect(checkRateLimit(key, 3, 60_000)).toBe(true);

		// 4th request should be blocked
		expect(checkRateLimit(key, 3, 60_000)).toBe(false);
		// 5th request should also be blocked
		expect(checkRateLimit(key, 3, 60_000)).toBe(false);
	});

	it("treats different keys independently", async () => {
		const checkRateLimit = await getCheckRateLimit();
		const keyA = "test:key-a";
		const keyB = "test:key-b";

		// Exhaust key A
		expect(checkRateLimit(keyA, 1, 60_000)).toBe(true);
		expect(checkRateLimit(keyA, 1, 60_000)).toBe(false);

		// Key B should still be allowed
		expect(checkRateLimit(keyB, 1, 60_000)).toBe(true);
	});

	it("resets after the time window expires", async () => {
		const checkRateLimit = await getCheckRateLimit();
		const key = "test:window-reset";

		// Exhaust the limit
		expect(checkRateLimit(key, 2, 10_000)).toBe(true);
		expect(checkRateLimit(key, 2, 10_000)).toBe(true);
		expect(checkRateLimit(key, 2, 10_000)).toBe(false);

		// Advance time past the window
		vi.advanceTimersByTime(10_001);

		// Should be allowed again — window has reset
		expect(checkRateLimit(key, 2, 10_000)).toBe(true);
		expect(checkRateLimit(key, 2, 10_000)).toBe(true);
		expect(checkRateLimit(key, 2, 10_000)).toBe(false);
	});

	it("does not reset before the window expires", async () => {
		const checkRateLimit = await getCheckRateLimit();
		const key = "test:no-early-reset";

		expect(checkRateLimit(key, 1, 10_000)).toBe(true);
		expect(checkRateLimit(key, 1, 10_000)).toBe(false);

		// Advance time, but not past the window
		vi.advanceTimersByTime(9_999);

		// Should still be blocked
		expect(checkRateLimit(key, 1, 10_000)).toBe(false);
	});

	it("runs cleanup after 60 seconds and removes expired entries", async () => {
		const checkRateLimit = await getCheckRateLimit();

		// Create an entry with a short window
		const key = "test:cleanup-target";
		checkRateLimit(key, 1, 5_000);

		// Advance time past the entry's window AND past the cleanup interval (60s)
		vi.advanceTimersByTime(61_000);

		// Next call triggers cleanup, which should remove the expired entry.
		// The key should get a fresh window (allowed again).
		expect(checkRateLimit(key, 1, 5_000)).toBe(true);
	});

	it("runs cleanup when store exceeds max entries", async () => {
		const checkRateLimit = await getCheckRateLimit();

		// Create more than MAX_ENTRIES (10,000) entries with a very short window
		for (let i = 0; i < 10_001; i++) {
			checkRateLimit(`flood:${i}`, 1, 1_000);
		}

		// Advance past the short window so all entries are expired
		vi.advanceTimersByTime(1_001);

		// Next call should trigger cleanup due to store size >= MAX_ENTRIES
		// and the new key should be allowed
		const key = "test:after-flood";
		expect(checkRateLimit(key, 1, 60_000)).toBe(true);
	});

	it("returns true for a single request with limit of 1", async () => {
		const checkRateLimit = await getCheckRateLimit();
		expect(checkRateLimit("test:single", 1, 60_000)).toBe(true);
		expect(checkRateLimit("test:single", 1, 60_000)).toBe(false);
	});
});
