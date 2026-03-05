import { describe, it, expect } from "vitest";
import { getEmbedUrl } from "../video";

describe("getEmbedUrl", () => {
	// --- YouTube ---
	it("extracts YouTube watch URL", () => {
		expect(getEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
			"https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
		);
	});

	it("extracts YouTube short URL (youtu.be)", () => {
		expect(getEmbedUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(
			"https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
		);
	});

	it("extracts YouTube embed URL", () => {
		expect(getEmbedUrl("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe(
			"https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
		);
	});

	it("handles YouTube URL with extra params", () => {
		expect(getEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=120")).toBe(
			"https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
		);
	});

	it("handles YouTube URL with hyphens and underscores in ID", () => {
		expect(getEmbedUrl("https://www.youtube.com/watch?v=a-B_c1D2e3f")).toBe(
			"https://www.youtube-nocookie.com/embed/a-B_c1D2e3f",
		);
	});

	// --- Vimeo ---
	it("extracts Vimeo standard URL", () => {
		expect(getEmbedUrl("https://vimeo.com/123456789")).toBe(
			"https://player.vimeo.com/video/123456789",
		);
	});

	it("extracts Vimeo /video/ URL", () => {
		expect(getEmbedUrl("https://vimeo.com/video/123456789")).toBe(
			"https://player.vimeo.com/video/123456789",
		);
	});

	it("extracts Vimeo player URL", () => {
		expect(getEmbedUrl("https://player.vimeo.com/video/987654321")).toBe(
			"https://player.vimeo.com/video/987654321",
		);
	});

	// --- Invalid / unsupported ---
	it("returns null for empty string", () => {
		expect(getEmbedUrl("")).toBeNull();
	});

	it("returns null for unsupported URL", () => {
		expect(getEmbedUrl("https://example.com/video")).toBeNull();
	});

	it("returns null for plain text", () => {
		expect(getEmbedUrl("not a url")).toBeNull();
	});

	it("returns null for Dailymotion (unsupported)", () => {
		expect(getEmbedUrl("https://www.dailymotion.com/video/x123abc")).toBeNull();
	});

	it("returns null for YouTube URL with short ID (< 11 chars)", () => {
		expect(getEmbedUrl("https://www.youtube.com/watch?v=short")).toBeNull();
	});

	// --- Security ---
	it("returns null for javascript: protocol", () => {
		expect(getEmbedUrl("javascript:alert(1)")).toBeNull();
	});

	it("returns null for data: protocol", () => {
		expect(getEmbedUrl("data:text/html,<script>alert(1)</script>")).toBeNull();
	});
});
