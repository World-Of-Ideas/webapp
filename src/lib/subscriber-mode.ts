export type SubscriberMode = "waitlist" | "newsletter" | "off";

/** Derive subscriber mode from feature flags. Waitlist takes priority if both are somehow enabled. */
export function getSubscriberMode(features: Record<string, boolean>): SubscriberMode {
	if (features.waitlist) return "waitlist";
	if (features.newsletter) return "newsletter";
	return "off";
}
