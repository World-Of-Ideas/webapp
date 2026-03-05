import type { ContentBlock } from "@/types/content";
import { cn, isSafeUrl } from "@/lib/utils";

interface BannerBlockProps {
	block: ContentBlock;
}

export function BannerBlock({ block }: BannerBlockProps) {
	if (!block.text) return null;

	const variant = block.bannerVariant ?? "gradient";

	const baseClasses = "not-prose my-6 rounded-lg px-6 py-8 text-center sm:px-8 sm:py-10";

	if (variant === "image" && block.bannerBackground && isSafeUrl(block.bannerBackground) && !/[)"']/.test(block.bannerBackground)) {
		return (
			<div
				className={cn(baseClasses, "relative overflow-hidden bg-cover bg-center")}
				style={{ backgroundImage: `url("${block.bannerBackground}")` }}
			>
				<div className="absolute inset-0 bg-black/60" aria-hidden="true" />
				<div className="relative">
					<p className="text-lg font-semibold text-white sm:text-xl">{block.text}</p>
					{block.link && block.linkText && isSafeUrl(block.link) && (
						<a
							href={block.link}
							className="mt-4 inline-block rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black hover:bg-white/90"
						>
							{block.linkText}
						</a>
					)}
				</div>
			</div>
		);
	}

	if (variant === "solid") {
		return (
			<div className={cn(baseClasses, "bg-primary text-primary-foreground")}>
				<p className="text-lg font-semibold sm:text-xl">{block.text}</p>
				{block.link && block.linkText && isSafeUrl(block.link) && (
					<a
						href={block.link}
						className="mt-4 inline-block rounded-full bg-primary-foreground px-6 py-2.5 text-sm font-medium text-primary hover:opacity-90"
					>
						{block.linkText}
					</a>
				)}
			</div>
		);
	}

	// Default: gradient
	return (
		<div
			className={cn(baseClasses, "text-primary-foreground")}
			style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))" }}
		>
			<p className="text-lg font-semibold sm:text-xl">{block.text}</p>
			{block.link && block.linkText && isSafeUrl(block.link) && (
				<a
					href={block.link}
					className="mt-4 inline-block rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black hover:bg-white/90"
				>
					{block.linkText}
				</a>
			)}
		</div>
	);
}
