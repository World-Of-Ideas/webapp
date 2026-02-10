import { describe, it, expect } from "vitest";
import { isSafeUrl } from "../utils";

describe("isSafeUrl", () => {
	describe("safe URLs", () => {
		it("returns true for https URLs", () => {
			expect(isSafeUrl("https://example.com")).toBe(true);
		});

		it("returns true for http URLs", () => {
			expect(isSafeUrl("http://example.com")).toBe(true);
		});

		it("returns true for root-relative paths", () => {
			expect(isSafeUrl("/about")).toBe(true);
		});

		it("returns true for relative paths", () => {
			expect(isSafeUrl("about/us")).toBe(true);
		});

		it("returns true for hash fragments", () => {
			expect(isSafeUrl("#section")).toBe(true);
		});

		it("returns true for mailto: links", () => {
			expect(isSafeUrl("mailto:user@example.com")).toBe(true);
		});

		it("returns true for tel: links", () => {
			expect(isSafeUrl("tel:+1234567890")).toBe(true);
		});
	});

	describe("javascript: protocol", () => {
		it("returns false for lowercase javascript:", () => {
			expect(isSafeUrl("javascript:alert(1)")).toBe(false);
		});

		it("returns false for uppercase JAVASCRIPT:", () => {
			expect(isSafeUrl("JAVASCRIPT:alert(1)")).toBe(false);
		});

		it("returns false for mixed case JaVaScRiPt:", () => {
			expect(isSafeUrl("JaVaScRiPt:alert(1)")).toBe(false);
		});

		it("returns false for javascript: with leading whitespace", () => {
			expect(isSafeUrl("  javascript:alert(1)")).toBe(false);
		});

		it("returns false for javascript: with trailing whitespace", () => {
			expect(isSafeUrl("javascript:alert(1)  ")).toBe(false);
		});

		it("returns false for javascript: with leading tab", () => {
			expect(isSafeUrl("\tjavascript:alert(1)")).toBe(false);
		});
	});

	describe("data: protocol", () => {
		it("returns false for lowercase data:", () => {
			expect(isSafeUrl("data:text/html,<script>alert(1)</script>")).toBe(false);
		});

		it("returns false for uppercase DATA:", () => {
			expect(isSafeUrl("DATA:text/html,<script>alert(1)</script>")).toBe(false);
		});

		it("returns false for data: with leading whitespace", () => {
			expect(isSafeUrl("  data:text/html,test")).toBe(false);
		});
	});

	describe("vbscript: protocol", () => {
		it("returns false for lowercase vbscript:", () => {
			expect(isSafeUrl("vbscript:MsgBox(1)")).toBe(false);
		});

		it("returns false for uppercase VBSCRIPT:", () => {
			expect(isSafeUrl("VBSCRIPT:MsgBox(1)")).toBe(false);
		});
	});

	describe("edge cases", () => {
		it("returns true for empty string", () => {
			expect(isSafeUrl("")).toBe(true);
		});

		it("returns true for a URL containing 'javascript' not as protocol", () => {
			expect(isSafeUrl("https://example.com/javascript-tips")).toBe(true);
		});

		it("returns true for a URL containing 'data' not as protocol", () => {
			expect(isSafeUrl("https://example.com/data-science")).toBe(true);
		});

		it("returns true for whitespace-only string", () => {
			expect(isSafeUrl("   ")).toBe(true);
		});
	});
});
