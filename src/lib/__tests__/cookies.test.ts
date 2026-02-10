import { describe, it, expect } from "vitest";
import {
	parseConsentCookie,
	hasConsent,
	buildConsentCookieValue,
	CONSENT_COOKIE_NAME,
	CONSENT_MAX_AGE,
} from "../cookies";

describe("cookies", () => {
	describe("constants", () => {
		it("exports the correct cookie name", () => {
			expect(CONSENT_COOKIE_NAME).toBe("cookie_consent");
		});

		it("exports a max age of 1 year in seconds", () => {
			expect(CONSENT_MAX_AGE).toBe(365 * 24 * 60 * 60);
		});
	});

	describe("parseConsentCookie", () => {
		it("returns null when value is undefined (no cookie set)", () => {
			expect(parseConsentCookie(undefined)).toBeNull();
		});

		it("returns an empty set when value is 'none'", () => {
			const result = parseConsentCookie("none");
			expect(result).toBeInstanceOf(Set);
			expect(result!.size).toBe(0);
		});

		it("parses a single category", () => {
			const result = parseConsentCookie("analytics");
			expect(result).toBeInstanceOf(Set);
			expect(result!.has("analytics")).toBe(true);
			expect(result!.size).toBe(1);
		});

		it("parses multiple categories", () => {
			const result = parseConsentCookie("analytics,marketing");
			expect(result).toBeInstanceOf(Set);
			expect(result!.has("analytics")).toBe(true);
			expect(result!.has("marketing")).toBe(true);
			expect(result!.size).toBe(2);
		});

		it("ignores unknown categories", () => {
			const result = parseConsentCookie("analytics,unknown,marketing");
			expect(result!.has("analytics")).toBe(true);
			expect(result!.has("marketing")).toBe(true);
			expect(result!.size).toBe(2);
		});

		it("returns empty set when all categories are unknown", () => {
			const result = parseConsentCookie("foo,bar");
			expect(result).toBeInstanceOf(Set);
			expect(result!.size).toBe(0);
		});

		it("handles empty string (no categories accepted)", () => {
			const result = parseConsentCookie("");
			expect(result).toBeInstanceOf(Set);
			expect(result!.size).toBe(0);
		});

		it("deduplicates repeated categories", () => {
			const result = parseConsentCookie("analytics,analytics");
			expect(result!.size).toBe(1);
			expect(result!.has("analytics")).toBe(true);
		});
	});

	describe("hasConsent", () => {
		it("returns true when consent is not enabled (bypass mode)", () => {
			expect(hasConsent(false, undefined, "analytics")).toBe(true);
			expect(hasConsent(false, undefined, "marketing")).toBe(true);
		});

		it("returns true when consent is not enabled even with cookie value", () => {
			expect(hasConsent(false, "none", "analytics")).toBe(true);
		});

		it("returns false when consent is enabled but cookie is absent", () => {
			expect(hasConsent(true, undefined, "analytics")).toBe(false);
			expect(hasConsent(true, undefined, "marketing")).toBe(false);
		});

		it("returns false when consent is enabled and user rejected all", () => {
			expect(hasConsent(true, "none", "analytics")).toBe(false);
			expect(hasConsent(true, "none", "marketing")).toBe(false);
		});

		it("returns true when consent is enabled and category is accepted", () => {
			expect(hasConsent(true, "analytics", "analytics")).toBe(true);
			expect(hasConsent(true, "analytics,marketing", "marketing")).toBe(true);
		});

		it("returns false when consent is enabled but specific category is not accepted", () => {
			expect(hasConsent(true, "analytics", "marketing")).toBe(false);
			expect(hasConsent(true, "marketing", "analytics")).toBe(false);
		});

		it("returns true for both categories when both are accepted", () => {
			expect(hasConsent(true, "analytics,marketing", "analytics")).toBe(true);
			expect(hasConsent(true, "analytics,marketing", "marketing")).toBe(true);
		});
	});

	describe("buildConsentCookieValue", () => {
		it("returns 'none' for empty array", () => {
			expect(buildConsentCookieValue([])).toBe("none");
		});

		it("returns single category as-is", () => {
			expect(buildConsentCookieValue(["analytics"])).toBe("analytics");
		});

		it("joins multiple categories with comma", () => {
			expect(buildConsentCookieValue(["analytics", "marketing"])).toBe("analytics,marketing");
		});

		it("produces values that parseConsentCookie can round-trip", () => {
			const categories: ("analytics" | "marketing")[] = ["analytics", "marketing"];
			const cookieValue = buildConsentCookieValue(categories);
			const parsed = parseConsentCookie(cookieValue);
			expect(parsed!.has("analytics")).toBe(true);
			expect(parsed!.has("marketing")).toBe(true);
			expect(parsed!.size).toBe(2);
		});

		it("round-trips the empty case through 'none'", () => {
			const cookieValue = buildConsentCookieValue([]);
			const parsed = parseConsentCookie(cookieValue);
			expect(parsed!.size).toBe(0);
		});
	});
});
