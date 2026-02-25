/** Shared validation helpers for API routes. */

import { isSafeUrl } from "./utils";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
	return EMAIL_REGEX.test(email) && email.length <= 254;
}

/** Safely parse JSON from a Request, returning null on failure instead of throwing. */
export async function safeParseJson(request: Request): Promise<unknown | null> {
	try {
		return await request.json();
	} catch {
		return null;
	}
}

/** Validate a string field length. Returns error message or null. */
export function validateLength(
	value: string | undefined | null,
	fieldName: string,
	max: number,
): string | null {
	if (value && value.length > max) {
		return `${fieldName} is too long (max ${max} characters)`;
	}
	return null;
}

/** Escape LIKE wildcard characters to prevent pattern injection. */
export function escapeLike(query: string): string {
	return query.replace(/[%_]/g, "\\$&");
}

/** Validate a URL slug format. Returns error message or null. */
export function validateSlug(slug: string): string | null {
	if (!slug) return "Slug is required";
	if (slug.length > 200) return "Slug is too long (max 200 characters)";
	if (!/^[a-z0-9]+(?:[/-][a-z0-9]+)*$/.test(slug)) {
		return "Slug must contain only lowercase letters, numbers, hyphens, and forward slashes";
	}
	return null;
}

/** Validate a blog post creation body. Returns error message or null. */
export function validatePostBody(body: unknown): string | null {
	if (!body || typeof body !== "object") return "Invalid request body";
	const b = body as Record<string, unknown>;
	if (typeof b.slug !== "string" || !b.slug) return "Slug is required";
	const slugErr = validateSlug(b.slug);
	if (slugErr) return slugErr;
	if (typeof b.title !== "string" || !b.title) return "Title is required";
	if (b.title.length > 200) return "Title is too long (max 200 characters)";
	if (typeof b.description !== "string" || !b.description) return "Description is required";
	if (b.description.length > 500) return "Description is too long (max 500 characters)";
	if (b.content !== undefined && !Array.isArray(b.content)) return "Content must be an array";
	if (b.faqs !== undefined && b.faqs !== null && !Array.isArray(b.faqs)) return "FAQs must be an array";
	if (b.tags !== undefined && b.tags !== null && !Array.isArray(b.tags)) return "Tags must be an array";
	if (b.coverImage !== undefined && b.coverImage !== null && typeof b.coverImage !== "string") return "Cover image must be a string";
	if (b.author !== undefined && typeof b.author !== "string") return "Author must be a string";
	if (b.published !== undefined && typeof b.published !== "boolean") return "Published must be a boolean";
	return null;
}

/** Validate a blog post update body. Returns error message or null. */
export function validatePostUpdateBody(body: unknown): string | null {
	if (!body || typeof body !== "object") return "Invalid request body";
	const b = body as Record<string, unknown>;
	if (b.slug !== undefined) {
		if (typeof b.slug !== "string" || !b.slug) return "Slug must be a non-empty string";
		const slugErr = validateSlug(b.slug);
		if (slugErr) return slugErr;
	}
	if (b.title !== undefined && (typeof b.title !== "string" || !b.title)) return "Title must be a non-empty string";
	if (b.title !== undefined && (b.title as string).length > 200) return "Title is too long (max 200 characters)";
	if (b.description !== undefined && (typeof b.description !== "string" || !b.description)) return "Description must be a non-empty string";
	if (b.description !== undefined && (b.description as string).length > 500) return "Description is too long (max 500 characters)";
	if (b.content !== undefined && !Array.isArray(b.content)) return "Content must be an array";
	if (b.faqs !== undefined && b.faqs !== null && !Array.isArray(b.faqs)) return "FAQs must be an array";
	if (b.tags !== undefined && b.tags !== null && !Array.isArray(b.tags)) return "Tags must be an array";
	if (b.published !== undefined && typeof b.published !== "boolean") return "Published must be a boolean";
	return null;
}

/** Validate a page creation/update body. Returns error message or null. */
export function validatePageBody(body: unknown, requireSlug = true): string | null {
	if (!body || typeof body !== "object") return "Invalid request body";
	const b = body as Record<string, unknown>;
	if (requireSlug) {
		if (typeof b.slug !== "string" || !b.slug) return "Slug is required";
		const slugErr = validateSlug(b.slug);
		if (slugErr) return slugErr;
	}
	if (typeof b.title !== "string" || !b.title) return "Title is required";
	if (b.title.length > 200) return "Title is too long (max 200 characters)";
	if (b.description !== undefined && b.description !== null && typeof b.description !== "string") return "Description must be a string";
	if (b.content !== undefined && b.content !== null && !Array.isArray(b.content)) return "Content must be an array";
	if (b.faqs !== undefined && b.faqs !== null && !Array.isArray(b.faqs)) return "FAQs must be an array";
	if (b.relatedPages !== undefined && b.relatedPages !== null && !Array.isArray(b.relatedPages)) return "Related pages must be an array";
	if (b.published !== undefined && typeof b.published !== "boolean") return "Published must be a boolean";
	if (b.sortOrder !== undefined && typeof b.sortOrder !== "number") return "Sort order must be a number";
	if (b.layout !== undefined) {
		const validLayouts = ["default", "landing", "listing", "pillar"];
		if (typeof b.layout !== "string" || !validLayouts.includes(b.layout)) {
			return "Layout must be one of: default, landing, listing, pillar";
		}
	}
	return null;
}

const VALID_HERO_VARIANTS = ["centered", "gradient", "split"];
const VALID_HEADER_VARIANTS = ["solid", "blur", "transparent"];
const VALID_FOOTER_VARIANTS = ["simple", "columns", "dark"];
const VALID_POST_CARD_VARIANTS = ["bordered", "filled", "minimal"];
const VALID_CTA_VARIANTS = ["gradient", "solid", "outlined"];
const VALID_FONT_FAMILIES = ["inter", "geist", "dm-sans", "space-grotesk"];
const VALID_BORDER_RADII = ["0", "0.375rem", "0.5rem", "0.625rem", "9999px"];
const VALID_HEADING_WEIGHTS = ["300", "400", "500", "600", "700"];
const VALID_PRESET_KEYS = ["minimal", "bold", "corporate", "playful"];
const VALID_SOCIAL_KEYS = ["twitter", "github", "discord", "instagram"];
const VALID_PRODUCT_LINK_KEYS = ["appUrl", "appStoreUrl", "playStoreUrl"];
const VALID_THEME_KEYS = new Set(["preset", "accentColor", "borderRadius", "headingWeight", "fontFamily", "heroVariant", "headerVariant", "footerVariant", "postCardVariant", "ctaSectionVariant"]);

/** Validate site settings update body. Returns error message or null. */
export function validateSiteSettingsBody(body: unknown): string | null {
	if (!body || typeof body !== "object") return "Invalid request body";
	const b = body as Record<string, unknown>;

	if (b.name !== undefined) {
		if (typeof b.name !== "string" || !b.name) return "Name is required";
		if (b.name.length > 200) return "Name is too long (max 200 characters)";
	}
	if (b.description !== undefined) {
		if (typeof b.description !== "string") return "Description must be a string";
		if (b.description.length > 500) return "Description is too long (max 500 characters)";
	}
	if (b.author !== undefined) {
		if (typeof b.author !== "string") return "Author must be a string";
		if (b.author.length > 200) return "Author is too long (max 200 characters)";
	}
	if (b.social !== undefined) {
		if (typeof b.social !== "object" || b.social === null || Array.isArray(b.social)) return "Social must be an object";
		for (const [key, val] of Object.entries(b.social as Record<string, unknown>)) {
			if (!VALID_SOCIAL_KEYS.includes(key)) return `Unknown social key: ${key}`;
			if (typeof val !== "string") return `social.${key} must be a string`;
			if (val.length > 200) return `social.${key} is too long (max 200 characters)`;
			if (key === "twitter") {
				if (val && !/^@?[a-zA-Z0-9_]{1,15}$/.test(val)) return "social.twitter must be a valid handle (e.g. @username)";
			} else if (val && !isSafeUrl(val)) {
				return `social.${key} must be a valid URL`;
			}
		}
	}
	if (b.productLinks !== undefined) {
		if (typeof b.productLinks !== "object" || b.productLinks === null || Array.isArray(b.productLinks)) return "productLinks must be an object";
		for (const [key, val] of Object.entries(b.productLinks as Record<string, unknown>)) {
			if (!VALID_PRODUCT_LINK_KEYS.includes(key)) return `Unknown productLinks key: ${key}`;
			if (typeof val !== "string") return `productLinks.${key} must be a string`;
			if (val.length > 500) return `productLinks.${key} is too long (max 500 characters)`;
			if (val && !isSafeUrl(val)) return `productLinks.${key} must be a valid URL`;
		}
	}
	if (b.features !== undefined) {
		if (typeof b.features !== "object" || b.features === null || Array.isArray(b.features)) return "Features must be an object";
		const featureEntries = Object.entries(b.features as Record<string, unknown>);
		if (featureEntries.length > 20) return "Too many feature keys (max 20)";
		for (const [key, val] of featureEntries) {
			if (key.length > 50) return `Feature key "${key.slice(0, 20)}..." is too long (max 50 characters)`;
			if (typeof val !== "boolean") return `features.${key} must be a boolean`;
		}
	}
	if (b.ui !== undefined) {
		if (typeof b.ui !== "object" || b.ui === null || Array.isArray(b.ui)) return "UI must be an object";
		const uiEntries = Object.entries(b.ui as Record<string, unknown>);
		if (uiEntries.length > 20) return "Too many UI keys (max 20)";
		for (const [key, val] of uiEntries) {
			if (key.length > 50) return `UI key "${key.slice(0, 20)}..." is too long (max 50 characters)`;
			if (typeof val !== "boolean") return `ui.${key} must be a boolean`;
		}
	}
	if (b.theme !== undefined) {
		if (typeof b.theme !== "object" || b.theme === null || Array.isArray(b.theme)) return "Theme must be an object";
		const t = b.theme as Record<string, unknown>;
		for (const key of Object.keys(t)) {
			if (!VALID_THEME_KEYS.has(key)) return `Unknown theme key: ${key}`;
		}
		if (t.preset !== undefined) {
			if (typeof t.preset !== "string" || !VALID_PRESET_KEYS.includes(t.preset)) {
				return `theme.preset must be one of: ${VALID_PRESET_KEYS.join(", ")}`;
			}
		}
		if (t.accentColor !== undefined) {
			if (typeof t.accentColor !== "string") return "theme.accentColor must be a string";
			if (!/^#[0-9a-fA-F]{6}$/.test(t.accentColor)) return "theme.accentColor must be a valid hex color (e.g. #9747ff)";
		}
		if (t.borderRadius !== undefined) {
			if (typeof t.borderRadius !== "string" || !VALID_BORDER_RADII.includes(t.borderRadius)) {
				return `theme.borderRadius must be one of: ${VALID_BORDER_RADII.join(", ")}`;
			}
		}
		if (t.headingWeight !== undefined) {
			if (typeof t.headingWeight !== "string" || !VALID_HEADING_WEIGHTS.includes(t.headingWeight)) {
				return `theme.headingWeight must be one of: ${VALID_HEADING_WEIGHTS.join(", ")}`;
			}
		}
		if (t.fontFamily !== undefined) {
			if (typeof t.fontFamily !== "string" || !VALID_FONT_FAMILIES.includes(t.fontFamily)) {
				return `theme.fontFamily must be one of: ${VALID_FONT_FAMILIES.join(", ")}`;
			}
		}
		if (t.heroVariant !== undefined) {
			if (typeof t.heroVariant !== "string" || !VALID_HERO_VARIANTS.includes(t.heroVariant)) {
				return `theme.heroVariant must be one of: ${VALID_HERO_VARIANTS.join(", ")}`;
			}
		}
		if (t.headerVariant !== undefined) {
			if (typeof t.headerVariant !== "string" || !VALID_HEADER_VARIANTS.includes(t.headerVariant)) {
				return `theme.headerVariant must be one of: ${VALID_HEADER_VARIANTS.join(", ")}`;
			}
		}
		if (t.footerVariant !== undefined) {
			if (typeof t.footerVariant !== "string" || !VALID_FOOTER_VARIANTS.includes(t.footerVariant)) {
				return `theme.footerVariant must be one of: ${VALID_FOOTER_VARIANTS.join(", ")}`;
			}
		}
		if (t.postCardVariant !== undefined) {
			if (typeof t.postCardVariant !== "string" || !VALID_POST_CARD_VARIANTS.includes(t.postCardVariant)) {
				return `theme.postCardVariant must be one of: ${VALID_POST_CARD_VARIANTS.join(", ")}`;
			}
		}
		if (t.ctaSectionVariant !== undefined) {
			if (typeof t.ctaSectionVariant !== "string" || !VALID_CTA_VARIANTS.includes(t.ctaSectionVariant)) {
				return `theme.ctaSectionVariant must be one of: ${VALID_CTA_VARIANTS.join(", ")}`;
			}
		}
	}
	if (b.logoUrl !== undefined && b.logoUrl !== null) {
		if (typeof b.logoUrl !== "string") return "logoUrl must be a string or null";
		if (b.logoUrl.length > 500) return "logoUrl is too long (max 500 characters)";
		if (!isSafeUrl(b.logoUrl)) return "logoUrl must be a valid URL";
	}

	return null;
}

/** Validate an R2 upload path. Returns error message or null. */
export function validateR2Path(path: string): string | null {
	if (path.includes("..")) {
		return "Path must not contain '..'";
	}
	if (path.startsWith("/")) {
		return "Path must not start with '/'";
	}
	if (!/^[a-zA-Z0-9._\/-]+$/.test(path)) {
		return "Path contains invalid characters";
	}
	if (path.length > 200) {
		return "Path is too long (max 200 characters)";
	}
	return null;
}
