import type { ContentBlock } from "@/types/content";
import { cn } from "@/lib/utils";

interface CalloutBlockProps {
	block: ContentBlock;
}

const variantStyles = {
	info: "border-blue-500 bg-blue-50 dark:bg-blue-950/30",
	tip: "border-green-500 bg-green-50 dark:bg-green-950/30",
	warning: "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30",
};

const variantLabels = {
	info: "Info",
	tip: "Tip",
	warning: "Warning",
};

export function CalloutBlock({ block }: CalloutBlockProps) {
	if (!block.text) return null;

	const variant = block.variant ?? "info";

	return (
		<div
			className={cn(
				"not-prose my-6 rounded-lg border-l-4 p-4",
				variantStyles[variant],
			)}
		>
			<p className="mb-1 text-sm font-semibold">{variantLabels[variant]}</p>
			<p className="text-sm">{block.text}</p>
		</div>
	);
}
