import { describe, it, expect } from "vitest";
import { isGiveawayEnded } from "../giveaway";

describe("isGiveawayEnded", () => {
	it("returns false when endDate is undefined", () => {
		expect(isGiveawayEnded(undefined)).toBe(false);
	});

	it("returns true for a past date", () => {
		expect(isGiveawayEnded("2020-01-01")).toBe(true);
	});

	it("returns false for a future date", () => {
		expect(isGiveawayEnded("2099-12-31")).toBe(false);
	});

	it("returns false for an invalid date string", () => {
		expect(isGiveawayEnded("not-a-date")).toBe(false);
	});
});
