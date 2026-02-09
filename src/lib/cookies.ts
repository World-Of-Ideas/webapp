export const CONSENT_COOKIE_NAME = "cookie_consent";
export const CONSENT_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

export type ConsentCategory = "analytics" | "marketing";

/**
 * Parse the consent cookie value into a set of accepted categories.
 * Returns null if no decision has been made (cookie absent).
 */
export function parseConsentCookie(value: string | undefined): Set<ConsentCategory> | null {
	if (value === undefined) return null;
	if (value === "none") return new Set();
	return new Set(
		value.split(",").filter((v): v is ConsentCategory => v === "analytics" || v === "marketing"),
	);
}

/**
 * Check whether the visitor has consented to a specific category.
 * If consent is not required (consentEnabled=false), always returns true.
 * If no decision yet (cookie absent), returns false (default-deny).
 */
export function hasConsent(
	consentEnabled: boolean,
	cookieValue: string | undefined,
	category: ConsentCategory,
): boolean {
	if (!consentEnabled) return true;
	const consent = parseConsentCookie(cookieValue);
	if (consent === null) return false;
	return consent.has(category);
}

export function buildConsentCookieValue(categories: ConsentCategory[]): string {
	return categories.length === 0 ? "none" : categories.join(",");
}

export function setConsentCookie(categories: ConsentCategory[]): void {
	const value = buildConsentCookieValue(categories);
	document.cookie = `${CONSENT_COOKIE_NAME}=${value};path=/;max-age=${CONSENT_MAX_AGE};SameSite=Lax`;
}
