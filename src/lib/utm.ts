export function getUtmParams(): string {
	if (typeof window === "undefined") return "";
	const params = new URLSearchParams(window.location.search);
	const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
	return keys
		.filter((k) => params.has(k))
		.map((k) => `${k}=${params.get(k)}`)
		.join("&");
}
