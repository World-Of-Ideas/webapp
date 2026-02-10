export function generateReferralCode(): string {
	const bytes = new Uint8Array(6);
	crypto.getRandomValues(bytes);
	return Array.from(bytes)
		.map((b) => b.toString(36).padStart(2, "0"))
		.join("")
		.slice(0, 8);
}

export function calculateEffectivePosition(
	basePosition: number,
	referralCount: number,
	boostFactor: number,
): number {
	const effectivePosition = basePosition - referralCount * boostFactor;
	return Math.max(1, effectivePosition);
}
