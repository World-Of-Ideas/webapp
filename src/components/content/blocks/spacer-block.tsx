import type { ContentBlock } from "@/types/content";

interface SpacerBlockProps {
	block: ContentBlock;
}

const sizeClasses: Record<string, string> = {
	sm: "h-4",
	md: "h-8",
	lg: "h-16",
	xl: "h-24",
};

export function SpacerBlock({ block }: SpacerBlockProps) {
	const size = block.spacerSize && sizeClasses[block.spacerSize] ? block.spacerSize : "md";

	return <div className={sizeClasses[size]} aria-hidden="true" />;
}
