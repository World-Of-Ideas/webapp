import { cn, isSafeUrl } from "@/lib/utils";
import type { PricingTier } from "@/types/content";

interface PricingTiersProps {
	tiers: PricingTier[];
}

export function PricingTiers({ tiers }: PricingTiersProps) {
	return (
		<div className={cn(
			"grid gap-6",
			tiers.length === 2 && "md:grid-cols-2",
			tiers.length >= 3 && "md:grid-cols-3",
		)}>
			{tiers.map((tier) => (
				<div
					key={tier.name}
					className={cn(
						"relative flex flex-col rounded-xl border p-6 sm:p-8",
						tier.highlighted
							? "border-primary bg-primary/5 shadow-lg"
							: "border-border bg-card",
					)}
				>
					{tier.highlighted && (
						<span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
							Most Popular
						</span>
					)}

					<div className="mb-6">
						<h3 className="text-lg font-semibold">{tier.name}</h3>
						<p className="mt-1 text-sm text-muted-foreground">{tier.description}</p>
					</div>

					<div className="mb-6">
						<span className="text-4xl font-bold tracking-tight">{tier.price}</span>
						{tier.period && (
							<span className="text-sm text-muted-foreground">{tier.period}</span>
						)}
					</div>

					<ul className="mb-8 flex-1 space-y-2.5">
						{tier.features.map((feature) => (
							<li key={feature} className="flex items-start gap-2 text-sm">
								<svg className="mt-0.5 h-4 w-4 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
									<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
								</svg>
								{feature}
							</li>
						))}
					</ul>

					{tier.ctaUrl && isSafeUrl(tier.ctaUrl) ? (
						<a
							href={tier.ctaUrl}
							className={cn(
								"block w-full rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-colors",
								tier.highlighted
									? "bg-primary text-primary-foreground hover:bg-primary/90"
									: "border border-border bg-background text-foreground hover:bg-accent",
							)}
						>
							{tier.cta}
						</a>
					) : (
						<span
							className={cn(
								"block w-full rounded-lg px-4 py-2.5 text-center text-sm font-semibold",
								tier.highlighted
									? "bg-primary text-primary-foreground"
									: "border border-border bg-background text-foreground",
							)}
						>
							{tier.cta}
						</span>
					)}
				</div>
			))}
		</div>
	);
}
