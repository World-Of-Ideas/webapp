import { describe, it, expect, afterEach } from "vitest";
import { getUtmParams } from "@/lib/utm";

describe("utm", () => {
	// Save original window.location and restore after each test
	const originalLocation = globalThis.window?.location;

	function setWindowLocation(search: string) {
		// In Node/Vitest, window is not defined by default.
		// We create a minimal mock.
		Object.defineProperty(globalThis, "window", {
			value: {
				location: {
					search,
				},
			},
			writable: true,
			configurable: true,
		});
	}

	function removeWindow() {
		// Simulate server-side (no window)
		Object.defineProperty(globalThis, "window", {
			value: undefined,
			writable: true,
			configurable: true,
		});
	}

	afterEach(() => {
		// Restore original state
		if (originalLocation) {
			Object.defineProperty(globalThis, "window", {
				value: { location: originalLocation },
				writable: true,
				configurable: true,
			});
		} else {
			removeWindow();
		}
	});

	describe("getUtmParams", () => {
		it("returns empty string when window is undefined (SSR)", () => {
			removeWindow();
			expect(getUtmParams()).toBe("");
		});

		it("returns empty string when no UTM params present", () => {
			setWindowLocation("?foo=bar&baz=qux");
			expect(getUtmParams()).toBe("");
		});

		it("extracts a single UTM parameter", () => {
			setWindowLocation("?utm_source=google");
			expect(getUtmParams()).toBe("utm_source=google");
		});

		it("extracts all five UTM parameters", () => {
			setWindowLocation(
				"?utm_source=google&utm_medium=cpc&utm_campaign=spring&utm_term=shoes&utm_content=banner",
			);
			const result = getUtmParams();
			expect(result).toBe(
				"utm_source=google&utm_medium=cpc&utm_campaign=spring&utm_term=shoes&utm_content=banner",
			);
		});

		it("preserves order of UTM keys regardless of URL order", () => {
			// URL has them in reverse order, but output should follow the keys array order
			setWindowLocation(
				"?utm_content=banner&utm_term=shoes&utm_campaign=spring&utm_medium=cpc&utm_source=google",
			);
			const result = getUtmParams();
			expect(result).toBe(
				"utm_source=google&utm_medium=cpc&utm_campaign=spring&utm_term=shoes&utm_content=banner",
			);
		});

		it("ignores non-UTM parameters mixed in", () => {
			setWindowLocation("?ref=abc&utm_source=twitter&page=2&utm_campaign=launch");
			const result = getUtmParams();
			expect(result).toBe("utm_source=twitter&utm_campaign=launch");
		});

		it("returns empty string when search is empty", () => {
			setWindowLocation("");
			expect(getUtmParams()).toBe("");
		});

		it("handles UTM params with special characters", () => {
			setWindowLocation("?utm_source=g%20oogle&utm_medium=c%26pc");
			const result = getUtmParams();
			// URLSearchParams decodes via .get(), then encodeURIComponent re-encodes
			expect(result).toContain("utm_source=g%20oogle");
			expect(result).toContain("utm_medium=c%26pc");
		});
	});
});
