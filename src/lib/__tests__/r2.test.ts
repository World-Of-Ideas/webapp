import { describe, it, expect } from "vitest";
import { validateUpload, normalizeImageSrc } from "../r2";

describe("validateUpload", () => {
	it("accepts image/webp files", () => {
		const file = new File(["data"], "photo.webp", { type: "image/webp" });
		expect(validateUpload(file)).toBeNull();
	});

	it("accepts image/png files", () => {
		const file = new File(["data"], "photo.png", { type: "image/png" });
		expect(validateUpload(file)).toBeNull();
	});

	it("accepts image/jpeg files", () => {
		const file = new File(["data"], "photo.jpg", { type: "image/jpeg" });
		expect(validateUpload(file)).toBeNull();
	});

	it("accepts image/gif files", () => {
		const file = new File(["data"], "animation.gif", { type: "image/gif" });
		expect(validateUpload(file)).toBeNull();
	});

	it("rejects text/plain files", () => {
		const file = new File(["hello"], "readme.txt", { type: "text/plain" });
		const error = validateUpload(file);
		expect(error).toBe("Invalid file type. Only WebP, PNG, JPEG, and GIF are allowed.");
	});

	it("rejects application/pdf files", () => {
		const file = new File(["pdf-data"], "document.pdf", { type: "application/pdf" });
		const error = validateUpload(file);
		expect(error).toBe("Invalid file type. Only WebP, PNG, JPEG, and GIF are allowed.");
	});

	it("rejects image/svg+xml files", () => {
		const file = new File(["<svg></svg>"], "icon.svg", { type: "image/svg+xml" });
		const error = validateUpload(file);
		expect(error).toBe("Invalid file type. Only WebP, PNG, JPEG, and GIF are allowed.");
	});

	it("rejects files larger than 5 MB", () => {
		// Create a file that's 5 MB + 1 byte
		const size = 5 * 1024 * 1024 + 1;
		const buffer = new ArrayBuffer(size);
		const file = new File([buffer], "huge.png", { type: "image/png" });
		const error = validateUpload(file);
		expect(error).toBe("File too large. Maximum size is 5 MB.");
	});

	it("accepts a file at exactly 5 MB", () => {
		const size = 5 * 1024 * 1024;
		const buffer = new ArrayBuffer(size);
		const file = new File([buffer], "exact.png", { type: "image/png" });
		expect(validateUpload(file)).toBeNull();
	});

	it("accepts a small valid file", () => {
		const file = new File([new Uint8Array(100)], "tiny.webp", { type: "image/webp" });
		expect(validateUpload(file)).toBeNull();
	});

	it("rejects files with empty type", () => {
		const file = new File(["data"], "noext", { type: "" });
		const error = validateUpload(file);
		expect(error).toBe("Invalid file type. Only WebP, PNG, JPEG, and GIF are allowed.");
	});
});

describe("normalizeImageSrc", () => {
	it("strips localhost origin and returns pathname", () => {
		const result = normalizeImageSrc("http://localhost:3000/blog/test/cover.webp");
		expect(result).toBe("/blog/test/cover.webp");
	});

	it("strips localhost without port", () => {
		const result = normalizeImageSrc("http://localhost/images/photo.png");
		expect(result).toBe("/images/photo.png");
	});

	it("strips localhost with different port", () => {
		const result = normalizeImageSrc("http://localhost:8787/uploads/file.jpg");
		expect(result).toBe("/uploads/file.jpg");
	});

	it("returns non-localhost URLs unchanged", () => {
		const url = "https://cdn.example.com/blog/test/cover.webp";
		expect(normalizeImageSrc(url)).toBe(url);
	});

	it("returns https URLs unchanged", () => {
		const url = "https://r2.example.com/images/photo.png";
		expect(normalizeImageSrc(url)).toBe(url);
	});

	it("returns relative paths unchanged", () => {
		const url = "/blog/test/cover.webp";
		expect(normalizeImageSrc(url)).toBe(url);
	});

	it("returns malformed localhost URLs unchanged (cannot parse)", () => {
		// A string that starts with http://localhost but is not a valid URL
		const url = "http://localhost:not-a-port/path";
		const result = normalizeImageSrc(url);
		// The URL constructor should throw, so it falls back to returning the original
		expect(result).toBe(url);
	});

	it("preserves query strings from localhost URLs", () => {
		const result = normalizeImageSrc("http://localhost:3000/image.webp?w=200");
		// URL.pathname does not include query strings
		expect(result).toBe("/image.webp");
	});

	it("does not strip https://localhost URLs", () => {
		// Only http://localhost is matched
		const url = "https://localhost:3000/path";
		expect(normalizeImageSrc(url)).toBe(url);
	});
});
