import type { ContentBlock } from "@/types/content";

interface DividerBlockProps {
	block: ContentBlock;
}

export function DividerBlock({ block }: DividerBlockProps) {
	const style = block.dividerStyle ?? "line";

	if (style === "dots") {
		return (
			<div className="my-8 flex items-center justify-center gap-2" role="separator">
				<span className="h-1.5 w-1.5 rounded-full bg-border" aria-hidden="true" />
				<span className="h-1.5 w-1.5 rounded-full bg-border" aria-hidden="true" />
				<span className="h-1.5 w-1.5 rounded-full bg-border" aria-hidden="true" />
			</div>
		);
	}

	if (style === "gradient") {
		return (
			<div className="my-8" role="separator">
				<div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
			</div>
		);
	}

	// Default: line
	return <hr className="my-8 border-border" />;
}
