"use client";

export function CookiePreferencesButton() {
	return (
		<button
			type="button"
			className="text-sm text-muted-foreground hover:text-foreground"
			onClick={() => window.dispatchEvent(new Event("open-cookie-consent"))}
		>
			Cookie Preferences
		</button>
	);
}
