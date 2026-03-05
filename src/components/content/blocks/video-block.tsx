import type { ContentBlock } from "@/types/content";
import { getEmbedUrl } from "@/lib/video";

interface VideoBlockProps {
	block: ContentBlock;
}

export function VideoBlock({ block }: VideoBlockProps) {
	if (!block.videoUrl) return null;

	const embedUrl = getEmbedUrl(block.videoUrl);
	if (!embedUrl) return null;

	return (
		<div className="relative w-full overflow-hidden rounded-lg" style={{ paddingBottom: "56.25%" }}>
			<iframe
				src={embedUrl}
				title={block.text || "Video"}
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowFullScreen
				className="absolute inset-0 h-full w-full border-0"
				loading="lazy"
				sandbox="allow-scripts allow-same-origin allow-popups"
			/>
		</div>
	);
}
