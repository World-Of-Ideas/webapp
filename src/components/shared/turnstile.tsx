"use client";

import { Turnstile as TurnstileWidget } from "@marsidev/react-turnstile";
import { siteConfig } from "@/config/site";

interface TurnstileProps {
	onSuccess: (token: string) => void;
}

export function Turnstile({ onSuccess }: TurnstileProps) {
	return (
		<TurnstileWidget
			siteKey={siteConfig.turnstileSiteKey}
			onSuccess={onSuccess}
			options={{ appearance: "interaction-only" }}
		/>
	);
}
