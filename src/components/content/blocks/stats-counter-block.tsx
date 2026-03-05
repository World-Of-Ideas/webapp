import type { ContentBlock } from "@/types/content";
import { cn } from "@/lib/utils";

interface StatsCounterBlockProps {
	block: ContentBlock;
}

const columnClasses: Record<number, string> = {
	2: "grid-cols-1 sm:grid-cols-2",
	3: "grid-cols-1 sm:grid-cols-3",
	4: "grid-cols-2 sm:grid-cols-4",
	5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
	6: "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6",
};

export function StatsCounterBlock({ block }: StatsCounterBlockProps) {
	if (!block.stats || block.stats.length === 0) return null;

	const cols = block.columns && columnClasses[block.columns] ? block.columns : 3;

	return (
		<div className={cn("not-prose my-6 grid gap-6", columnClasses[cols])}>
			{block.stats.map((stat, i) => (
				<div key={i} className="text-center">
					<p className="text-3xl font-bold text-foreground">
						{stat.prefix && <span>{stat.prefix}</span>}
						{stat.value}
						{stat.suffix && <span>{stat.suffix}</span>}
					</p>
					{stat.label && (
						<p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
					)}
				</div>
			))}
		</div>
	);
}
