import type { ContentBlock } from "@/types/content";

interface QuoteBlockProps {
	block: ContentBlock;
}

export function QuoteBlock({ block }: QuoteBlockProps) {
	if (!block.text) return null;

	return <blockquote>{block.text}</blockquote>;
}
