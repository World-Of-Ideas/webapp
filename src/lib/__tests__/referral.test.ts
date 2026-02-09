import { describe, it, expect } from "vitest";
import { generateReferralCode, calculateEffectivePosition } from "../referral";

describe("generateReferralCode", () => {
	it("returns an 8-character string", async () => {
		const code = await generateReferralCode();
		expect(code).toHaveLength(8);
	});

	it("returns alphanumeric characters", async () => {
		const code = await generateReferralCode();
		expect(code).toMatch(/^[a-z0-9]+$/);
	});

	it("generates unique codes across calls", async () => {
		const codes = await Promise.all(
			Array.from({ length: 10 }, () => generateReferralCode()),
		);
		const unique = new Set(codes);
		expect(unique.size).toBe(10);
	});
});

describe("calculateEffectivePosition", () => {
	it("returns base position when no referrals", () => {
		expect(calculateEffectivePosition(100, 0, 5)).toBe(100);
	});

	it("reduces position by referralCount * boostFactor", () => {
		expect(calculateEffectivePosition(100, 10, 5)).toBe(50);
	});

	it("clamps to minimum of 1", () => {
		expect(calculateEffectivePosition(100, 50, 5)).toBe(1);
	});

	it("never returns less than 1 even at position 1", () => {
		expect(calculateEffectivePosition(1, 0, 5)).toBe(1);
	});
});
