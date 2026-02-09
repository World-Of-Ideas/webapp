import type { ContentBlock } from "@/types/content";

interface HeadingBlockProps {
	block: ContentBlock;
}

export function HeadingBlock({ block }: HeadingBlockProps) {
	if (!block.text) return null;

	switch (block.level) {
		case 3:
			return <h3>{block.text}</h3>;
		case 4:
			return <h4>{block.text}</h4>;
		default:
			return <h2>{block.text}</h2>;
	}
}
