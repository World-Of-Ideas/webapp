import type { ContentBlock } from "@/types/content";

interface ListBlockProps {
	block: ContentBlock;
}

export function ListBlock({ block }: ListBlockProps) {
	if (!block.items || block.items.length === 0) return null;

	const Tag = block.ordered ? "ol" : "ul";

	return (
		<Tag>
			{block.items.map((item, i) => (
				<li key={i}>{item}</li>
			))}
		</Tag>
	);
}
