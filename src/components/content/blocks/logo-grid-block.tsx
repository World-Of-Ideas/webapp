import type { ContentBlock } from "@/types/content";
import { cn, isSafeUrl } from "@/lib/utils";

interface LogoGridBlockProps {
	block: ContentBlock;
}

const columnClasses: Record<number, string> = {
	2: "grid-cols-2",
	3: "grid-cols-2 sm:grid-cols-3",
	4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
	5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
	6: "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6",
};

export function LogoGridBlock({ block }: LogoGridBlockProps) {
	if (!block.logos || block.logos.length === 0) return null;

	const cols = block.columns && columnClasses[block.columns] ? block.columns : 4;

	return (
		<div className={cn("not-prose my-6 grid items-center gap-6", columnClasses[cols])}>
			{block.logos.map((logo, i) => {
				if (!logo.image || !isSafeUrl(logo.image)) return null;

				const img = (
					<img
						src={logo.image}
						alt={logo.alt || ""}
						className="h-12 w-auto object-contain grayscale transition-all hover:grayscale-0"
						loading="lazy"
					/>
				);

				if (logo.href && isSafeUrl(logo.href)) {
					return (
						<a
							key={i}
							href={logo.href}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center justify-center"
						>
							{img}
						</a>
					);
				}

				return (
					<div key={i} className="flex items-center justify-center">
						{img}
					</div>
				);
			})}
		</div>
	);
}
