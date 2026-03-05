import type { ContentBlock } from "@/types/content";
import { slugifyHeading } from "@/lib/utils";

interface TocBlockProps {
	block: ContentBlock;
	allBlocks: ContentBlock[];
}

export function TocBlock({ block, allBlocks }: TocBlockProps) {
	const maxLevel = block.tocMaxLevel ?? 3;
	const title = block.tocTitle || "Table of Contents";

	const headings = allBlocks.filter(
		(b) => b.type === "heading" && b.text && (b.level ?? 2) <= maxLevel,
	);

	if (headings.length === 0) return null;

	return (
		<nav aria-label="Table of Contents" className="my-6 rounded-lg border bg-muted/10 p-5">
			<p className="mb-3 text-base font-semibold text-foreground">{title}</p>
			<ul className="space-y-1.5">
				{headings.map((h, i) => {
					const level = h.level ?? 2;
					const id = slugifyHeading(h.text!);
					return (
						<li
							key={i}
							className={
								level === 3
									? "pl-4"
									: level === 4
										? "pl-8"
										: undefined
							}
						>
							<a
								href={`#${id}`}
								className="text-sm text-muted-foreground hover:text-foreground hover:underline"
							>
								{h.text}
							</a>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
