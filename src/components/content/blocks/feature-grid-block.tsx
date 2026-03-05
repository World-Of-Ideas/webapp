import type { ContentBlock } from "@/types/content";
import { cn } from "@/lib/utils";

interface FeatureGridBlockProps {
	block: ContentBlock;
}

const columnClasses: Record<number, string> = {
	2: "grid-cols-1 sm:grid-cols-2",
	3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
	4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
	5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
	6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
};

export function FeatureGridBlock({ block }: FeatureGridBlockProps) {
	if (!block.features || block.features.length === 0) return null;

	const cols = block.columns && columnClasses[block.columns] ? block.columns : 3;

	return (
		<div className={cn("not-prose my-6 grid gap-4", columnClasses[cols])}>
			{block.features.map((feature, i) => (
				<div key={i} className="rounded-lg border border-border p-5">
					{feature.icon && (
						<span className="mb-2 block text-2xl" aria-hidden="true">
							{feature.icon}
						</span>
					)}
					<h3 className="text-base font-semibold text-foreground">
						{feature.title}
					</h3>
					{feature.description && (
						<p className="mt-1 text-sm text-muted-foreground">
							{feature.description}
						</p>
					)}
				</div>
			))}
		</div>
	);
}
