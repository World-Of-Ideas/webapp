import { describe, it, expect } from "vitest";
import { hexToOklch, hexToOklchLight } from "../color";

/** Parse "oklch(L C H)" into [L, C, H] numbers. */
function parseOklch(oklch: string): [number, number, number] {
	const match = oklch.match(/oklch\(([^ ]+) ([^ ]+) ([^)]+)\)/);
	if (!match) throw new Error(`Invalid oklch: ${oklch}`);
	return [parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3])];
}

describe("hexToOklch", () => {
	it("returns oklch string for pure black", () => {
		const result = hexToOklch("#000000");
		expect(result).toMatch(/^oklch\(/);
		// Black should have ~0 lightness and ~0 chroma
		const [l, c] = parseOklch(result);
		expect(l).toBeCloseTo(0, 1);
		expect(c).toBeCloseTo(0, 2);
	});

	it("returns oklch string for pure white", () => {
		const result = hexToOklch("#ffffff");
		const [l, c] = parseOklch(result);
		// White should have ~1 lightness and ~0 chroma
		expect(l).toBeCloseTo(1, 1);
		expect(c).toBeCloseTo(0, 2);
	});

	it("returns consistent results for same input", () => {
		expect(hexToOklch("#9747ff")).toBe(hexToOklch("#9747ff"));
	});

	it("handles uppercase hex", () => {
		expect(hexToOklch("#9747FF")).toBe(hexToOklch("#9747ff"));
	});

	it("returns valid oklch format for a color", () => {
		const result = hexToOklch("#2563eb");
		expect(result).toMatch(/^oklch\(\d+\.\d+ \d+\.\d+ \d+\.\d+\)$/);
	});

	it("produces non-zero chroma for saturated colors", () => {
		const result = hexToOklch("#ff0000");
		const [, c] = parseOklch(result);
		expect(c).toBeGreaterThan(0.1);
	});

	it("produces different results for different colors", () => {
		expect(hexToOklch("#ff0000")).not.toBe(hexToOklch("#0000ff"));
	});

	it("produces correct oklch for pure red (#ff0000)", () => {
		const result = hexToOklch("#ff0000");
		const [l, c, h] = parseOklch(result);
		expect(l).toBeCloseTo(0.628, 2);
		expect(c).toBeCloseTo(0.258, 2);
		expect(h).toBeCloseTo(29.2, 0);
	});

	it("produces correct oklch for pure blue (#0000ff)", () => {
		const result = hexToOklch("#0000ff");
		const [l, c, h] = parseOklch(result);
		expect(l).toBeCloseTo(0.452, 2);
		expect(c).toBeCloseTo(0.313, 2);
		expect(h).toBeCloseTo(264.1, 0);
	});
});

describe("hexToOklch — invalid input guard", () => {
	it("returns fallback for 3-digit hex", () => {
		expect(hexToOklch("#fff")).toBe("oklch(0.5 0 0)");
	});

	it("returns fallback for empty string", () => {
		expect(hexToOklch("")).toBe("oklch(0.5 0 0)");
	});

	it("returns fallback for non-hex string", () => {
		expect(hexToOklch("not-a-color")).toBe("oklch(0.5 0 0)");
	});

	it("returns fallback for hex without hash", () => {
		expect(hexToOklch("ff0000")).toBe("oklch(0.5 0 0)");
	});
});

describe("hexToOklchLight — invalid input guard", () => {
	it("returns fallback for invalid hex", () => {
		expect(hexToOklchLight("#abc")).toBe("oklch(0.6 0 0)");
	});
});

describe("hexToOklchLight", () => {
	it("returns lighter variant than hexToOklch", () => {
		const normal = hexToOklch("#9747ff");
		const light = hexToOklchLight("#9747ff");
		const [normalL] = parseOklch(normal);
		const [lightL] = parseOklch(light);
		expect(lightL).toBeGreaterThan(normalL);
	});

	it("caps lightness at 0.85", () => {
		// White is already at L≈1, so light variant should cap at 0.85
		const light = hexToOklchLight("#ffffff");
		const [l] = parseOklch(light);
		expect(l).toBeLessThanOrEqual(0.851);
	});

	it("preserves chroma and hue", () => {
		const normal = hexToOklch("#9747ff");
		const light = hexToOklchLight("#9747ff");
		const [, normalC, normalH] = parseOklch(normal);
		const [, lightC, lightH] = parseOklch(light);
		expect(lightC).toBeCloseTo(normalC, 3);
		expect(lightH).toBeCloseTo(normalH, 1);
	});

	it("bumps lightness by approximately 0.1", () => {
		// Mid-range color where cap won't kick in
		const normal = hexToOklch("#333333");
		const light = hexToOklchLight("#333333");
		const [normalL] = parseOklch(normal);
		const [lightL] = parseOklch(light);
		expect(lightL - normalL).toBeCloseTo(0.1, 2);
	});
});
