import type { ContentBlock } from "@/types/content";

interface EmbedBlockProps {
	block: ContentBlock;
}

export function EmbedBlock({ block }: EmbedBlockProps) {
	if (!block.embedUrl || !block.embedUrl.startsWith("https://")) return null;

	const height = Math.min(Math.max(block.embedHeight ?? 400, 100), 2000);

	return (
		<div className="not-prose my-6 overflow-hidden rounded-lg border border-border">
			<iframe
				src={block.embedUrl}
				title={block.text || "Embedded content"}
				className="w-full border-0"
				style={{ height: `${height}px` }}
				loading="lazy"
				sandbox="allow-scripts allow-popups"
			/>
		</div>
	);
}
