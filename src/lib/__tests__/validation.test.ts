import { describe, it, expect } from "vitest";
import {
	isValidEmail,
	safeParseJson,
	validateLength,
	escapeLike,
	validateR2Path,
	validateSlug,
	validatePostBody,
	validatePostUpdateBody,
	validatePageBody,
	validateSiteSettingsBody,
	validateRedirectBody,
	validateRedirectUpdateBody,
} from "../validation";

describe("isValidEmail", () => {
	it("returns true for a standard valid email", () => {
		expect(isValidEmail("user@example.com")).toBe(true);
	});

	it("returns true for emails with subdomains", () => {
		expect(isValidEmail("user@mail.example.co.uk")).toBe(true);
	});

	it("returns true for emails with uppercase characters", () => {
		expect(isValidEmail("User@Example.COM")).toBe(true);
	});

	it("returns true for emails with plus addressing", () => {
		expect(isValidEmail("user+tag@example.com")).toBe(true);
	});

	it("returns true for emails with dots in local part", () => {
		expect(isValidEmail("first.last@example.com")).toBe(true);
	});

	it("returns false for email missing @ symbol", () => {
		expect(isValidEmail("userexample.com")).toBe(false);
	});

	it("returns false for email missing domain", () => {
		expect(isValidEmail("user@")).toBe(false);
	});

	it("returns false for email missing local part", () => {
		expect(isValidEmail("@example.com")).toBe(false);
	});

	it("returns false for email with spaces", () => {
		expect(isValidEmail("user @example.com")).toBe(false);
		expect(isValidEmail("user@ example.com")).toBe(false);
		expect(isValidEmail(" user@example.com")).toBe(false);
	});

	it("returns false for empty string", () => {
		expect(isValidEmail("")).toBe(false);
	});

	it("returns false for email exceeding 254 characters", () => {
		const longLocal = "a".repeat(243); // 243 + @ + example.com = 255
		expect(isValidEmail(`${longLocal}@example.com`)).toBe(false);
	});

	it("returns true for email at exactly 254 characters", () => {
		const longLocal = "a".repeat(242); // 242 + @ + example.com = 254
		expect(isValidEmail(`${longLocal}@example.com`)).toBe(true);
	});

	it("returns false for email missing TLD", () => {
		expect(isValidEmail("user@localhost")).toBe(false);
	});

	it("returns false for multiple @ symbols", () => {
		expect(isValidEmail("user@@example.com")).toBe(false);
	});
});

describe("safeParseJson", () => {
	it("parses valid JSON from a Request", async () => {
		const body = JSON.stringify({ name: "Test", value: 42 });
		const request = new Request("https://example.com", {
			method: "POST",
			body,
			headers: { "Content-Type": "application/json" },
		});

		const result = await safeParseJson(request);
		expect(result).toEqual({ name: "Test", value: 42 });
	});

	it("returns null for malformed JSON", async () => {
		const request = new Request("https://example.com", {
			method: "POST",
			body: "{ invalid json",
			headers: { "Content-Type": "application/json" },
		});

		const result = await safeParseJson(request);
		expect(result).toBeNull();
	});

	it("returns null for non-JSON body", async () => {
		const request = new Request("https://example.com", {
			method: "POST",
			body: "just plain text",
			headers: { "Content-Type": "text/plain" },
		});

		const result = await safeParseJson(request);
		expect(result).toBeNull();
	});

	it("parses JSON arrays", async () => {
		const request = new Request("https://example.com", {
			method: "POST",
			body: JSON.stringify([1, 2, 3]),
			headers: { "Content-Type": "application/json" },
		});

		const result = await safeParseJson(request);
		expect(result).toEqual([1, 2, 3]);
	});

	it("parses JSON with null value", async () => {
		const request = new Request("https://example.com", {
			method: "POST",
			body: "null",
			headers: { "Content-Type": "application/json" },
		});

		const result = await safeParseJson(request);
		expect(result).toBeNull();
	});

	it("returns null for empty body", async () => {
		const request = new Request("https://example.com", {
			method: "POST",
			body: "",
			headers: { "Content-Type": "application/json" },
		});

		const result = await safeParseJson(request);
		expect(result).toBeNull();
	});
});

describe("validateLength", () => {
	it("returns null for null value", () => {
		expect(validateLength(null, "Name", 100)).toBeNull();
	});

	it("returns null for undefined value", () => {
		expect(validateLength(undefined, "Name", 100)).toBeNull();
	});

	it("returns null for empty string", () => {
		expect(validateLength("", "Name", 100)).toBeNull();
	});

	it("returns null for value within limit", () => {
		expect(validateLength("hello", "Name", 100)).toBeNull();
	});

	it("returns null for value at exactly the limit", () => {
		expect(validateLength("abcde", "Name", 5)).toBeNull();
	});

	it("returns error message for value over limit", () => {
		const result = validateLength("abcdef", "Name", 5);
		expect(result).toBe("Name is too long (max 5 characters)");
	});

	it("includes the field name in the error message", () => {
		const result = validateLength("toolong", "Email", 3);
		expect(result).toContain("Email");
	});

	it("includes the max length in the error message", () => {
		const result = validateLength("toolong", "Field", 3);
		expect(result).toContain("3");
	});
});

describe("escapeLike", () => {
	it("returns normal strings unchanged", () => {
		expect(escapeLike("hello world")).toBe("hello world");
	});

	it("escapes % characters", () => {
		expect(escapeLike("100%")).toBe("100\\%");
	});

	it("escapes _ characters", () => {
		expect(escapeLike("user_name")).toBe("user\\_name");
	});

	it("escapes both % and _ characters", () => {
		expect(escapeLike("50%_off")).toBe("50\\%\\_off");
	});

	it("escapes multiple occurrences", () => {
		expect(escapeLike("%%__")).toBe("\\%\\%\\_\\_");
	});

	it("returns empty string unchanged", () => {
		expect(escapeLike("")).toBe("");
	});

	it("does not escape other special characters", () => {
		expect(escapeLike("hello!@#$^&*()")).toBe("hello!@#$^&*()");
	});
});

describe("validateR2Path", () => {
	it("returns null for a valid simple path", () => {
		expect(validateR2Path("blog/cover.webp")).toBeNull();
	});

	it("returns null for a valid nested path", () => {
		expect(validateR2Path("blog/my-post/images/photo.webp")).toBeNull();
	});

	it("returns null for a path with dots in filename", () => {
		expect(validateR2Path("uploads/file.name.webp")).toBeNull();
	});

	it("returns null for a path with underscores and hyphens", () => {
		expect(validateR2Path("uploads/my_file-name/image.webp")).toBeNull();
	});

	it("returns error for path containing '..'", () => {
		const result = validateR2Path("blog/../secret/file.txt");
		expect(result).toBe("Path must not contain '..'");
	});

	it("returns error for path starting with '/'", () => {
		const result = validateR2Path("/blog/cover.webp");
		expect(result).toBe("Path must not start with '/'");
	});

	it("returns error for path with spaces", () => {
		const result = validateR2Path("blog/my file.webp");
		expect(result).toBe("Path contains invalid characters");
	});

	it("returns error for path with special characters", () => {
		expect(validateR2Path("blog/file@name.webp")).toBe(
			"Path contains invalid characters",
		);
		expect(validateR2Path("blog/file#name.webp")).toBe(
			"Path contains invalid characters",
		);
		expect(validateR2Path("blog/file?query.webp")).toBe(
			"Path contains invalid characters",
		);
	});

	it("returns error for path exceeding 200 characters", () => {
		const longPath = "a/".repeat(100) + "b"; // 201 characters
		const result = validateR2Path(longPath);
		expect(result).toBe("Path is too long (max 200 characters)");
	});

	it("returns null for path at exactly 200 characters", () => {
		const path = "a".repeat(200);
		expect(validateR2Path(path)).toBeNull();
	});

	it("checks '..' before leading '/'", () => {
		// Path with both issues — ".." check comes first
		const result = validateR2Path("/../etc/passwd");
		expect(result).toBe("Path must not contain '..'");
	});
});

describe("validateSlug", () => {
	it("returns null for a simple valid slug", () => {
		expect(validateSlug("hello")).toBeNull();
	});

	it("returns null for a hyphenated slug", () => {
		expect(validateSlug("hello-world")).toBeNull();
	});

	it("returns null for a slug with a single slash", () => {
		expect(validateSlug("a/b")).toBeNull();
	});

	it("returns null for a nested slug with hyphens", () => {
		expect(validateSlug("a/b/c-d")).toBeNull();
	});

	it("returns error for empty string", () => {
		expect(validateSlug("")).toBe("Slug is required");
	});

	it("returns error for slug exceeding 200 characters", () => {
		const longSlug = "a".repeat(201);
		expect(validateSlug(longSlug)).toBe("Slug is too long (max 200 characters)");
	});

	it("returns error for uppercase characters", () => {
		expect(validateSlug("Hello")).toBeTruthy();
		expect(validateSlug("Hello")).toContain("lowercase");
	});

	it("returns error for consecutive hyphens", () => {
		expect(validateSlug("hello--world")).toBeTruthy();
	});

	it("returns error for leading hyphen", () => {
		expect(validateSlug("-hello")).toBeTruthy();
	});

	it("returns error for trailing hyphen", () => {
		expect(validateSlug("hello-")).toBeTruthy();
	});

	it("returns error for leading slash", () => {
		expect(validateSlug("/hello")).toBeTruthy();
	});

	it("returns error for trailing slash", () => {
		expect(validateSlug("hello/")).toBeTruthy();
	});
});

describe("validatePostBody", () => {
	it("returns null for a valid minimal post body", () => {
		expect(
			validatePostBody({
				slug: "test",
				title: "Test",
				description: "Desc",
				content: [],
			}),
		).toBeNull();
	});

	it("returns error when slug is missing", () => {
		expect(
			validatePostBody({ title: "Test", description: "Desc" }),
		).toBe("Slug is required");
	});

	it("returns error when title is missing", () => {
		expect(
			validatePostBody({ slug: "test", description: "Desc" }),
		).toBe("Title is required");
	});

	it("returns error when description is missing", () => {
		expect(
			validatePostBody({ slug: "test", title: "Test" }),
		).toBe("Description is required");
	});

	it("returns error when description is empty string", () => {
		expect(
			validatePostBody({ slug: "test", title: "Test", description: "" }),
		).toBe("Description is required");
	});

	it("returns error when slug is too long", () => {
		expect(
			validatePostBody({
				slug: "a".repeat(201),
				title: "Test",
				description: "Desc",
			}),
		).toContain("too long");
	});

	it("returns error when title is too long (201 chars)", () => {
		expect(
			validatePostBody({
				slug: "test",
				title: "a".repeat(201),
				description: "Desc",
			}),
		).toBe("Title is too long (max 200 characters)");
	});

	it("returns error when description is too long (501 chars)", () => {
		expect(
			validatePostBody({
				slug: "test",
				title: "Test",
				description: "a".repeat(501),
			}),
		).toBe("Description is too long (max 500 characters)");
	});

	it("returns error when content is not an array", () => {
		expect(
			validatePostBody({
				slug: "test",
				title: "Test",
				description: "Desc",
				content: "not-array",
			}),
		).toBe("Content must be an array");
	});

	it("returns error when faqs is not an array and not null", () => {
		expect(
			validatePostBody({
				slug: "test",
				title: "Test",
				description: "Desc",
				faqs: "not-array",
			}),
		).toBe("FAQs must be an array");
	});

	it("returns null when faqs is null", () => {
		expect(
			validatePostBody({
				slug: "test",
				title: "Test",
				description: "Desc",
				faqs: null,
			}),
		).toBeNull();
	});

	it("returns error when tags is not an array and not null", () => {
		expect(
			validatePostBody({
				slug: "test",
				title: "Test",
				description: "Desc",
				tags: "not-array",
			}),
		).toBe("Tags must be an array");
	});

	it("returns null when tags is null", () => {
		expect(
			validatePostBody({
				slug: "test",
				title: "Test",
				description: "Desc",
				tags: null,
			}),
		).toBeNull();
	});

	it("returns error when published is not a boolean", () => {
		expect(
			validatePostBody({
				slug: "test",
				title: "Test",
				description: "Desc",
				published: "yes",
			}),
		).toBe("Published must be a boolean");
	});

	it("does not error on extra unknown fields", () => {
		expect(
			validatePostBody({
				slug: "test",
				title: "Test",
				description: "Desc",
				extraField: 123,
				anotherExtra: "abc",
			}),
		).toBeNull();
	});

	it("accepts valid ISO date for scheduledPublishAt", () => {
		expect(
			validatePostBody({
				slug: "test",
				title: "T",
				description: "d",
				content: [],
				scheduledPublishAt: "2026-06-01T00:00:00Z",
			}),
		).toBeNull();
	});

	it("accepts null scheduledPublishAt", () => {
		expect(
			validatePostBody({
				slug: "test",
				title: "T",
				description: "d",
				content: [],
				scheduledPublishAt: null,
			}),
		).toBeNull();
	});

	it("accepts undefined scheduledPublishAt", () => {
		expect(
			validatePostBody({
				slug: "test",
				title: "T",
				description: "d",
				content: [],
			}),
		).toBeNull();
	});

	it("rejects non-string scheduledPublishAt", () => {
		expect(
			validatePostBody({
				slug: "test",
				title: "T",
				description: "d",
				content: [],
				scheduledPublishAt: 123,
			}),
		).toBe("scheduledPublishAt must be a string");
	});

	it("rejects invalid date for scheduledPublishAt", () => {
		expect(
			validatePostBody({
				slug: "test",
				title: "T",
				description: "d",
				content: [],
				scheduledPublishAt: "not-a-date",
			}),
		).toBe("scheduledPublishAt must be a valid ISO date");
	});

	it("rejects too long scheduledPublishAt", () => {
		expect(
			validatePostBody({
				slug: "test",
				title: "T",
				description: "d",
				content: [],
				scheduledPublishAt: "x".repeat(31),
			}),
		).toBe("scheduledPublishAt is too long");
	});
});

describe("validatePostUpdateBody", () => {
	it("returns null for an empty update body", () => {
		expect(validatePostUpdateBody({})).toBeNull();
	});

	it("returns null when only title is provided", () => {
		expect(validatePostUpdateBody({ title: "New" })).toBeNull();
	});

	it("returns null when only slug is provided with valid format", () => {
		expect(validatePostUpdateBody({ slug: "new-slug" })).toBeNull();
	});

	it("returns error when slug has invalid format", () => {
		expect(validatePostUpdateBody({ slug: "INVALID" })).toBeTruthy();
	});

	it("returns error when slug is empty string", () => {
		expect(validatePostUpdateBody({ slug: "" })).toBe(
			"Slug must be a non-empty string",
		);
	});

	it("returns error when title is empty string", () => {
		expect(validatePostUpdateBody({ title: "" })).toBe(
			"Title must be a non-empty string",
		);
	});

	it("returns error when content is not an array", () => {
		expect(validatePostUpdateBody({ content: "not-array" })).toBe(
			"Content must be an array",
		);
	});

	it("returns error when published is not a boolean", () => {
		expect(validatePostUpdateBody({ published: 1 })).toBe(
			"Published must be a boolean",
		);
	});

	it("returns error when description is empty string", () => {
		expect(validatePostUpdateBody({ description: "" })).toBe(
			"Description must be a non-empty string",
		);
	});

	it("returns error when description is too long", () => {
		expect(validatePostUpdateBody({ description: "a".repeat(501) })).toBe(
			"Description is too long (max 500 characters)",
		);
	});

	it("returns null when description is valid", () => {
		expect(validatePostUpdateBody({ description: "Valid desc" })).toBeNull();
	});

	it("accepts valid ISO date for scheduledPublishAt", () => {
		expect(
			validatePostUpdateBody({ scheduledPublishAt: "2026-06-01T00:00:00Z" }),
		).toBeNull();
	});

	it("accepts null scheduledPublishAt", () => {
		expect(
			validatePostUpdateBody({ scheduledPublishAt: null }),
		).toBeNull();
	});

	it("accepts undefined scheduledPublishAt (omitted)", () => {
		expect(validatePostUpdateBody({})).toBeNull();
	});

	it("rejects non-string scheduledPublishAt", () => {
		expect(
			validatePostUpdateBody({ scheduledPublishAt: 123 }),
		).toBe("scheduledPublishAt must be a string");
	});

	it("rejects invalid date for scheduledPublishAt", () => {
		expect(
			validatePostUpdateBody({ scheduledPublishAt: "not-a-date" }),
		).toBe("scheduledPublishAt must be a valid ISO date");
	});

	it("rejects too long scheduledPublishAt", () => {
		expect(
			validatePostUpdateBody({ scheduledPublishAt: "x".repeat(31) }),
		).toBe("scheduledPublishAt is too long");
	});
});

describe("validatePageBody", () => {
	it("returns null for a valid page body with requireSlug=true (default)", () => {
		expect(validatePageBody({ slug: "test", title: "Test" })).toBeNull();
	});

	it("returns null for a valid page body with requireSlug=false", () => {
		expect(validatePageBody({ title: "Test" }, false)).toBeNull();
	});

	it("returns error when title is missing", () => {
		expect(validatePageBody({ slug: "test" })).toBe("Title is required");
	});

	it("returns error when slug is missing and requireSlug=true", () => {
		expect(validatePageBody({ title: "Test" })).toBe("Slug is required");
	});

	it("returns error when content is not an array", () => {
		expect(
			validatePageBody({ slug: "test", title: "Test", content: "not-array" }),
		).toBe("Content must be an array");
	});

	it("returns null when content is null", () => {
		expect(
			validatePageBody({ slug: "test", title: "Test", content: null }),
		).toBeNull();
	});

	it("returns error when published is not a boolean", () => {
		expect(
			validatePageBody({ slug: "test", title: "Test", published: "yes" }),
		).toBe("Published must be a boolean");
	});

	it("returns error when sortOrder is not a number", () => {
		expect(
			validatePageBody({ slug: "test", title: "Test", sortOrder: "abc" }),
		).toBe("Sort order must be a number");
	});

	it("returns null when sortOrder is a valid number", () => {
		expect(
			validatePageBody({ slug: "test", title: "Test", sortOrder: 5 }),
		).toBeNull();
	});

	it("accepts valid ISO date for scheduledPublishAt", () => {
		expect(
			validatePageBody({ slug: "test", title: "Test", scheduledPublishAt: "2026-06-01T00:00:00Z" }),
		).toBeNull();
	});

	it("accepts null scheduledPublishAt", () => {
		expect(
			validatePageBody({ slug: "test", title: "Test", scheduledPublishAt: null }),
		).toBeNull();
	});

	it("accepts undefined scheduledPublishAt (omitted)", () => {
		expect(
			validatePageBody({ slug: "test", title: "Test" }),
		).toBeNull();
	});

	it("rejects non-string scheduledPublishAt", () => {
		expect(
			validatePageBody({ slug: "test", title: "Test", scheduledPublishAt: 123 }),
		).toBe("scheduledPublishAt must be a string");
	});

	it("rejects invalid date for scheduledPublishAt", () => {
		expect(
			validatePageBody({ slug: "test", title: "Test", scheduledPublishAt: "not-a-date" }),
		).toBe("scheduledPublishAt must be a valid ISO date");
	});

	it("rejects too long scheduledPublishAt", () => {
		expect(
			validatePageBody({ slug: "test", title: "Test", scheduledPublishAt: "x".repeat(31) }),
		).toBe("scheduledPublishAt is too long");
	});
});

describe("validateSiteSettingsBody", () => {
	it("returns null for empty object (all fields optional)", () => {
		expect(validateSiteSettingsBody({})).toBeNull();
	});

	it("rejects null body", () => {
		expect(validateSiteSettingsBody(null)).toBe("Invalid request body");
	});

	it("rejects non-object body", () => {
		expect(validateSiteSettingsBody("string")).toBe("Invalid request body");
	});

	// --- name ---
	it("accepts valid name", () => {
		expect(validateSiteSettingsBody({ name: "My Site" })).toBeNull();
	});

	it("rejects empty name", () => {
		expect(validateSiteSettingsBody({ name: "" })).toBe("Name is required");
	});

	it("rejects name over 200 chars", () => {
		expect(validateSiteSettingsBody({ name: "a".repeat(201) })).toBe("Name is too long (max 200 characters)");
	});

	// --- description ---
	it("accepts valid description", () => {
		expect(validateSiteSettingsBody({ description: "A description" })).toBeNull();
	});

	it("rejects non-string description", () => {
		expect(validateSiteSettingsBody({ description: 123 })).toBe("Description must be a string");
	});

	it("rejects description over 500 chars", () => {
		expect(validateSiteSettingsBody({ description: "a".repeat(501) })).toBe("Description is too long (max 500 characters)");
	});

	// --- author ---
	it("rejects author over 200 chars", () => {
		expect(validateSiteSettingsBody({ author: "a".repeat(201) })).toBe("Author is too long (max 200 characters)");
	});

	// --- social ---
	it("accepts valid social object", () => {
		expect(validateSiteSettingsBody({ social: { twitter: "@hello" } })).toBeNull();
	});

	it("rejects social as array", () => {
		expect(validateSiteSettingsBody({ social: ["twitter"] })).toBe("Social must be an object");
	});

	it("rejects social with non-string values", () => {
		expect(validateSiteSettingsBody({ social: { twitter: 123 } })).toBe("social.twitter must be a string");
	});

	it("rejects social value over 200 chars", () => {
		expect(validateSiteSettingsBody({ social: { twitter: "a".repeat(201) } })).toBe("social.twitter is too long (max 200 characters)");
	});

	// --- productLinks ---
	it("accepts valid productLinks", () => {
		expect(validateSiteSettingsBody({ productLinks: { appUrl: "https://app.example.com" } })).toBeNull();
	});

	it("rejects productLinks as null", () => {
		expect(validateSiteSettingsBody({ productLinks: null })).toBe("productLinks must be an object");
	});

	it("rejects productLinks value over 500 chars", () => {
		expect(validateSiteSettingsBody({ productLinks: { appUrl: "a".repeat(501) } })).toBe("productLinks.appUrl is too long (max 500 characters)");
	});

	// --- features ---
	it("accepts valid features", () => {
		expect(validateSiteSettingsBody({ features: { blog: true, waitlist: false } })).toBeNull();
	});

	it("rejects features with non-boolean values", () => {
		expect(validateSiteSettingsBody({ features: { blog: "yes" } })).toBe("features.blog must be a boolean");
	});

	it("rejects features as array", () => {
		expect(validateSiteSettingsBody({ features: [true] })).toBe("Features must be an object");
	});

	// --- ui ---
	it("accepts valid ui", () => {
		expect(validateSiteSettingsBody({ ui: { search: true } })).toBeNull();
	});

	it("rejects ui with non-boolean values", () => {
		expect(validateSiteSettingsBody({ ui: { search: 1 } })).toBe("ui.search must be a boolean");
	});

	// --- theme ---
	it("accepts valid theme", () => {
		expect(validateSiteSettingsBody({ theme: { preset: "bold", accentColor: "#9747ff" } })).toBeNull();
	});

	it("rejects theme as non-object", () => {
		expect(validateSiteSettingsBody({ theme: "bold" })).toBe("Theme must be an object");
	});

	it("rejects invalid hex color", () => {
		expect(validateSiteSettingsBody({ theme: { accentColor: "red" } })).toBe("theme.accentColor must be a valid hex color (e.g. #9747ff)");
	});

	it("rejects 3-digit hex color", () => {
		expect(validateSiteSettingsBody({ theme: { accentColor: "#fff" } })).toBe("theme.accentColor must be a valid hex color (e.g. #9747ff)");
	});

	it("accepts valid 6-digit hex color", () => {
		expect(validateSiteSettingsBody({ theme: { accentColor: "#FF00AA" } })).toBeNull();
	});

	it("rejects invalid fontFamily", () => {
		expect(validateSiteSettingsBody({ theme: { fontFamily: "comic-sans" } })).toMatch(/theme.fontFamily must be one of/);
	});

	it("accepts valid fontFamily", () => {
		expect(validateSiteSettingsBody({ theme: { fontFamily: "dm-sans" } })).toBeNull();
	});

	it("rejects invalid heroVariant", () => {
		expect(validateSiteSettingsBody({ theme: { heroVariant: "fullscreen" } })).toMatch(/theme.heroVariant must be one of/);
	});

	it("accepts valid heroVariant", () => {
		expect(validateSiteSettingsBody({ theme: { heroVariant: "split" } })).toBeNull();
	});

	it("rejects invalid headerVariant", () => {
		expect(validateSiteSettingsBody({ theme: { headerVariant: "sticky" } })).toMatch(/theme.headerVariant must be one of/);
	});

	it("rejects invalid footerVariant", () => {
		expect(validateSiteSettingsBody({ theme: { footerVariant: "mega" } })).toMatch(/theme.footerVariant must be one of/);
	});

	it("rejects invalid postCardVariant", () => {
		expect(validateSiteSettingsBody({ theme: { postCardVariant: "card" } })).toMatch(/theme.postCardVariant must be one of/);
	});

	it("rejects invalid ctaSectionVariant", () => {
		expect(validateSiteSettingsBody({ theme: { ctaSectionVariant: "rainbow" } })).toMatch(/theme.ctaSectionVariant must be one of/);
	});

	it("accepts all valid variants together", () => {
		expect(validateSiteSettingsBody({
			theme: {
				heroVariant: "centered",
				headerVariant: "solid",
				footerVariant: "columns",
				postCardVariant: "filled",
				ctaSectionVariant: "outlined",
				fontFamily: "space-grotesk",
				accentColor: "#2563eb",
			},
		})).toBeNull();
	});

	// --- logoUrl ---
	it("accepts valid logoUrl string", () => {
		expect(validateSiteSettingsBody({ logoUrl: "https://example.com/logo.png" })).toBeNull();
	});

	it("accepts null logoUrl", () => {
		expect(validateSiteSettingsBody({ logoUrl: null })).toBeNull();
	});

	it("rejects non-string logoUrl", () => {
		expect(validateSiteSettingsBody({ logoUrl: 123 })).toBe("logoUrl must be a string or null");
	});

	it("rejects logoUrl over 500 chars", () => {
		expect(validateSiteSettingsBody({ logoUrl: "https://example.com/" + "a".repeat(500) })).toBe("logoUrl is too long (max 500 characters)");
	});

	// --- missing type guards ---
	it("rejects name as number", () => {
		expect(validateSiteSettingsBody({ name: 123 })).toBe("Name is required");
	});

	it("rejects author as number", () => {
		expect(validateSiteSettingsBody({ author: 42 })).toBe("Author must be a string");
	});

	it("rejects social as null", () => {
		expect(validateSiteSettingsBody({ social: null })).toBe("Social must be an object");
	});

	it("rejects productLinks as array", () => {
		expect(validateSiteSettingsBody({ productLinks: ["https://example.com"] })).toBe("productLinks must be an object");
	});

	it("rejects productLinks with non-string value", () => {
		expect(validateSiteSettingsBody({ productLinks: { appUrl: 123 } })).toBe("productLinks.appUrl must be a string");
	});

	it("rejects ui as null", () => {
		expect(validateSiteSettingsBody({ ui: null })).toBe("UI must be an object");
	});

	it("rejects ui as array", () => {
		expect(validateSiteSettingsBody({ ui: [true] })).toBe("UI must be an object");
	});

	it("rejects theme as null", () => {
		expect(validateSiteSettingsBody({ theme: null })).toBe("Theme must be an object");
	});

	it("rejects theme as array", () => {
		expect(validateSiteSettingsBody({ theme: ["bold"] })).toBe("Theme must be an object");
	});

	it("rejects theme.preset as number", () => {
		expect(validateSiteSettingsBody({ theme: { preset: 123 } })).toMatch(/theme.preset must be one of/);
	});

	it("rejects theme.borderRadius as number", () => {
		expect(validateSiteSettingsBody({ theme: { borderRadius: 10 } })).toMatch(/theme.borderRadius must be one of/);
	});

	it("rejects invalid theme.borderRadius value", () => {
		expect(validateSiteSettingsBody({ theme: { borderRadius: "999px" } })).toMatch(/theme.borderRadius must be one of/);
	});

	it("rejects theme.headingWeight as number", () => {
		expect(validateSiteSettingsBody({ theme: { headingWeight: 400 } })).toMatch(/theme.headingWeight must be one of/);
	});

	it("rejects invalid theme.headingWeight value", () => {
		expect(validateSiteSettingsBody({ theme: { headingWeight: "bold" } })).toMatch(/theme.headingWeight must be one of/);
	});

	it("rejects unknown theme keys", () => {
		expect(validateSiteSettingsBody({ theme: { unknownKey: "value" } })).toBe("Unknown theme key: unknownKey");
	});

	it("rejects unknown social keys", () => {
		expect(validateSiteSettingsBody({ social: { linkedin: "https://linkedin.com" } })).toBe("Unknown social key provided");
	});

	it("rejects unknown productLinks keys", () => {
		expect(validateSiteSettingsBody({ productLinks: { websiteUrl: "https://example.com" } })).toBe("Unknown productLinks key: websiteUrl");
	});

	// --- adversarial inputs (documenting that validation does not sanitize HTML) ---
	it("accepts HTML in name (sanitization is at rendering layer)", () => {
		expect(validateSiteSettingsBody({ name: '<script>alert(1)</script>' })).toBeNull();
	});

	it("rejects javascript: URL in social links", () => {
		expect(validateSiteSettingsBody({ social: { github: "javascript:alert(1)" } })).toBe("social.github must be a valid URL");
	});

	it("rejects javascript: URL in product links", () => {
		expect(validateSiteSettingsBody({ productLinks: { appUrl: "javascript:alert(1)" } })).toBe("productLinks.appUrl must be a valid URL");
	});

	it("accepts twitter handle format", () => {
		expect(validateSiteSettingsBody({ social: { twitter: "@validhandle" } })).toBeNull();
	});

	it("rejects invalid twitter handle", () => {
		expect(validateSiteSettingsBody({ social: { twitter: "not a handle!" } })).toBe("social.twitter must be a valid handle (e.g. @username)");
	});

	it("accepts empty social values", () => {
		expect(validateSiteSettingsBody({ social: { twitter: "", github: "" } })).toBeNull();
	});

	it("rejects logoUrl with javascript: protocol", () => {
		expect(validateSiteSettingsBody({ logoUrl: "javascript:alert(1)" })).toBe("logoUrl must be a valid URL");
	});

	// --- announcement ---
	it("accepts valid announcement object", () => {
		expect(validateSiteSettingsBody({
			announcement: { enabled: true, text: "New launch!", linkUrl: "https://example.com", linkText: "Learn more" },
		})).toBeNull();
	});

	it("accepts empty announcement fields", () => {
		expect(validateSiteSettingsBody({
			announcement: { enabled: false, text: "", linkUrl: "", linkText: "" },
		})).toBeNull();
	});

	it("rejects announcement as non-object", () => {
		expect(validateSiteSettingsBody({ announcement: "hello" })).toBe("Announcement must be an object");
	});

	it("rejects announcement as null", () => {
		expect(validateSiteSettingsBody({ announcement: null })).toBe("Announcement must be an object");
	});

	it("rejects announcement as array", () => {
		expect(validateSiteSettingsBody({ announcement: [] })).toBe("Announcement must be an object");
	});

	it("rejects unknown announcement key", () => {
		expect(validateSiteSettingsBody({ announcement: { unknown: "value" } })).toBe("Unknown announcement key: unknown");
	});

	it("rejects non-boolean announcement.enabled", () => {
		expect(validateSiteSettingsBody({ announcement: { enabled: "yes" } })).toBe("announcement.enabled must be a boolean");
	});

	it("rejects non-string announcement.text", () => {
		expect(validateSiteSettingsBody({ announcement: { text: 123 } })).toBe("announcement.text must be a string");
	});

	it("rejects announcement.text over max length", () => {
		expect(validateSiteSettingsBody({ announcement: { text: "a".repeat(201) } })).toBe("announcement.text is too long (max 200 characters)");
	});

	it("rejects non-string announcement.linkUrl", () => {
		expect(validateSiteSettingsBody({ announcement: { linkUrl: 123 } })).toBe("announcement.linkUrl must be a string");
	});

	it("rejects announcement.linkUrl over max length", () => {
		expect(validateSiteSettingsBody({ announcement: { linkUrl: "https://example.com/" + "a".repeat(500) } })).toBe("announcement.linkUrl is too long (max 500 characters)");
	});

	it("rejects unsafe announcement.linkUrl", () => {
		expect(validateSiteSettingsBody({ announcement: { linkUrl: "javascript:alert(1)" } })).toBe("announcement.linkUrl must be a valid URL");
	});

	it("rejects non-string announcement.linkText", () => {
		expect(validateSiteSettingsBody({ announcement: { linkText: 123 } })).toBe("announcement.linkText must be a string");
	});

	it("rejects announcement.linkText over max length", () => {
		expect(validateSiteSettingsBody({ announcement: { linkText: "a".repeat(101) } })).toBe("announcement.linkText is too long (max 100 characters)");
	});

	// --- full valid body ---
	it("accepts complete valid body", () => {
		expect(validateSiteSettingsBody({
			name: "My Site",
			description: "A description",
			author: "Author",
			social: { twitter: "@test" },
			productLinks: { appUrl: "https://app.example.com" },
			features: { blog: true, waitlist: false },
			ui: { search: true },
			theme: { preset: "minimal", accentColor: "#1a1a1a" },
			announcement: { enabled: true, text: "Hello world" },
		})).toBeNull();
	});
});

describe("validateRedirectBody", () => {
	it("accepts valid redirect", () => {
		expect(validateRedirectBody({ fromPath: "/old", toUrl: "/new" })).toBeNull();
	});

	it("accepts with statusCode 302", () => {
		expect(validateRedirectBody({ fromPath: "/old", toUrl: "/new", statusCode: 302 })).toBeNull();
	});

	it("accepts with enabled false", () => {
		expect(validateRedirectBody({ fromPath: "/old", toUrl: "/new", enabled: false })).toBeNull();
	});

	it("accepts absolute toUrl", () => {
		expect(validateRedirectBody({ fromPath: "/old", toUrl: "https://example.com/new" })).toBeNull();
	});

	it("rejects null body", () => {
		expect(validateRedirectBody(null)).toBe("Invalid request body");
	});

	it("rejects non-object body", () => {
		expect(validateRedirectBody("string")).toBe("Invalid request body");
	});

	it("rejects missing fromPath", () => {
		expect(validateRedirectBody({ toUrl: "/new" })).toBe("fromPath is required");
	});

	it("rejects fromPath not starting with /", () => {
		expect(validateRedirectBody({ fromPath: "old", toUrl: "/new" })).toBe("fromPath must start with /");
	});

	it("rejects fromPath too long", () => {
		expect(validateRedirectBody({ fromPath: "/" + "a".repeat(500), toUrl: "/new" })).toBe("fromPath is too long");
	});

	it("rejects fromPath starting with /admin", () => {
		expect(validateRedirectBody({ fromPath: "/admin/test", toUrl: "/new" })).toBe("Cannot redirect admin or API paths");
	});

	it("rejects fromPath starting with /api", () => {
		expect(validateRedirectBody({ fromPath: "/api/test", toUrl: "/new" })).toBe("Cannot redirect admin or API paths");
	});

	it("rejects missing toUrl", () => {
		expect(validateRedirectBody({ fromPath: "/old" })).toBe("toUrl is required");
	});

	it("rejects toUrl too long", () => {
		expect(validateRedirectBody({ fromPath: "/old", toUrl: "/" + "a".repeat(2000) })).toBe("toUrl is too long");
	});

	it("rejects unsafe toUrl", () => {
		expect(validateRedirectBody({ fromPath: "/old", toUrl: "javascript:alert(1)" })).toBe("toUrl must be a safe URL");
	});

	it("rejects invalid statusCode", () => {
		expect(validateRedirectBody({ fromPath: "/old", toUrl: "/new", statusCode: 200 })).toBe("statusCode must be 301 or 302");
	});

	it("rejects non-boolean enabled", () => {
		expect(validateRedirectBody({ fromPath: "/old", toUrl: "/new", enabled: "yes" })).toBe("enabled must be a boolean");
	});
});

describe("validateRedirectUpdateBody", () => {
	it("accepts empty update (all fields optional)", () => {
		expect(validateRedirectUpdateBody({})).toBeNull();
	});

	it("accepts partial update with toUrl", () => {
		expect(validateRedirectUpdateBody({ toUrl: "/new-dest" })).toBeNull();
	});

	it("rejects unsafe toUrl", () => {
		expect(validateRedirectUpdateBody({ toUrl: "javascript:void(0)" })).toBe("toUrl must be a safe URL");
	});

	it("rejects empty fromPath", () => {
		expect(validateRedirectUpdateBody({ fromPath: "" })).toBe("fromPath must be a non-empty string");
	});

	it("rejects invalid statusCode", () => {
		expect(validateRedirectUpdateBody({ statusCode: 404 })).toBe("statusCode must be 301 or 302");
	});

	it("rejects non-boolean enabled", () => {
		expect(validateRedirectUpdateBody({ enabled: 1 })).toBe("enabled must be a boolean");
	});
});
