import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ThemeSettings } from "@/types/site-settings";

const ctaVariantStyles: Record<ThemeSettings["ctaSectionVariant"], {
	wrapper: string;
	overlay: string;
	heading: string;
	description: string;
	button: string;
}> = {
	gradient: {
		wrapper: "",
		overlay: "absolute inset-0 gradient-purple-br",
		heading: "text-white",
		description: "text-white/70",
		button: "bg-white text-black hover:bg-white/90",
	},
	solid: {
		wrapper: "bg-primary",
		overlay: "",
		heading: "text-primary-foreground",
		description: "text-primary-foreground/70",
		button: "bg-white text-black hover:bg-white/90",
	},
	outlined: {
		wrapper: "border-2 border-primary bg-background",
		overlay: "",
		heading: "text-foreground",
		description: "text-muted-foreground",
		button: "bg-primary text-primary-foreground hover:bg-primary/90",
	},
};

interface CtaSectionProps {
	title: string;
	description: string;
	buttonText: string;
	buttonHref: string;
	variant?: ThemeSettings["ctaSectionVariant"];
}

export function CtaSection({ title, description, buttonText, buttonHref, variant = "gradient" }: CtaSectionProps) {
	const styles = ctaVariantStyles[variant] ?? ctaVariantStyles.gradient;

	return (
		<section className={cn("relative overflow-hidden px-4 py-16 sm:px-6 sm:py-24", styles.wrapper)}>
			{styles.overlay && <div className={styles.overlay} aria-hidden="true" />}
			{variant === "gradient" && <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" aria-hidden="true" />}
			<div className="relative mx-auto max-w-3xl text-center">
				<h2 className={cn("text-2xl font-normal tracking-tight sm:text-3xl md:text-4xl", styles.heading)}>
					{title}
				</h2>
				<p className={cn("mt-4 text-base sm:text-lg", styles.description)}>
					{description}
				</p>
				<div className="mt-8">
					<Link
						href={buttonHref}
						className={cn("inline-block rounded-full px-8 py-3 text-sm font-medium transition-colors", styles.button)}
					>
						{buttonText}
					</Link>
				</div>
			</div>
		</section>
	);
}
