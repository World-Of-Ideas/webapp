/**
 * Pure-math hex-to-oklch conversion for CSS variable injection.
 * No external deps — uses sRGB → linear RGB → XYZ (D65) → LMS → Oklab → Oklch pipeline.
 */

function hexToRgb(hex: string): [number, number, number] {
	const h = hex.replace("#", "");
	if (h.length !== 6) return [0, 0, 0];
	return [
		parseInt(h.slice(0, 2), 16) / 255,
		parseInt(h.slice(2, 4), 16) / 255,
		parseInt(h.slice(4, 6), 16) / 255,
	];
}

function linearize(c: number): number {
	return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function rgbToOklab(r: number, g: number, b: number): [number, number, number] {
	const lr = linearize(r);
	const lg = linearize(g);
	const lb = linearize(b);

	const l_ = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
	const m_ = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
	const s_ = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);

	const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
	const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
	const bv = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

	return [L, a, bv];
}

function oklabToOklch(L: number, a: number, b: number): [number, number, number] {
	const C = Math.sqrt(a * a + b * b);
	let h = (Math.atan2(b, a) * 180) / Math.PI;
	if (h < 0) h += 360;
	return [L, C, h];
}

/** Convert hex color to oklch CSS string: "oklch(L C H)" */
export function hexToOklch(hex: string): string {
	if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return "oklch(0.5 0 0)";
	const [r, g, b] = hexToRgb(hex);
	const [L, a, bv] = rgbToOklab(r, g, b);
	const [l, c, h] = oklabToOklch(L, a, bv);
	return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(1)})`;
}

/** Convert hex color to a lighter oklch variant (for dark-mode primary). */
export function hexToOklchLight(hex: string): string {
	if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return "oklch(0.6 0 0)";
	const [r, g, b] = hexToRgb(hex);
	const [L, a, bv] = rgbToOklab(r, g, b);
	const [, c, h] = oklabToOklch(L, a, bv);
	// Bump lightness by ~0.1, cap at 0.85
	const lightL = Math.min(L + 0.1, 0.85);
	return `oklch(${lightL.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(1)})`;
}
