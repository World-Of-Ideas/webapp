import { describe, it, expect } from "vitest";
import { generateUnsubscribeToken, verifyUnsubscribeToken } from "../waitlist";

const TEST_SECRET = "test-secret-key-for-hmac";

describe("generateUnsubscribeToken", () => {
	it("returns a hex string", async () => {
		const token = await generateUnsubscribeToken("user@example.com", TEST_SECRET);
		expect(token).toMatch(/^[0-9a-f]+$/);
	});

	it("returns a 64-character hex string (SHA-256 = 32 bytes)", async () => {
		const token = await generateUnsubscribeToken("user@example.com", TEST_SECRET);
		expect(token).toHaveLength(64);
	});

	it("returns the same token for the same input", async () => {
		const token1 = await generateUnsubscribeToken("user@example.com", TEST_SECRET);
		const token2 = await generateUnsubscribeToken("user@example.com", TEST_SECRET);
		expect(token1).toBe(token2);
	});

	it("returns different tokens for different emails", async () => {
		const token1 = await generateUnsubscribeToken("a@example.com", TEST_SECRET);
		const token2 = await generateUnsubscribeToken("b@example.com", TEST_SECRET);
		expect(token1).not.toBe(token2);
	});
});

describe("verifyUnsubscribeToken", () => {
	it("returns true for a valid token", async () => {
		const token = await generateUnsubscribeToken("user@example.com", TEST_SECRET);
		const valid = await verifyUnsubscribeToken("user@example.com", token, TEST_SECRET);
		expect(valid).toBe(true);
	});

	it("returns false for a wrong token", async () => {
		const valid = await verifyUnsubscribeToken("user@example.com", "wrong-token", TEST_SECRET);
		expect(valid).toBe(false);
	});

	it("returns false for a wrong email", async () => {
		const token = await generateUnsubscribeToken("user@example.com", TEST_SECRET);
		const valid = await verifyUnsubscribeToken("wrong@email.com", token, TEST_SECRET);
		expect(valid).toBe(false);
	});

	it("returns false for a wrong secret", async () => {
		const token = await generateUnsubscribeToken("user@example.com", TEST_SECRET);
		const valid = await verifyUnsubscribeToken("user@example.com", token, "wrong-secret");
		expect(valid).toBe(false);
	});
});
