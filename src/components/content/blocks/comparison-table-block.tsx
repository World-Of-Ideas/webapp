import type { ContentBlock } from "@/types/content";
import { cn } from "@/lib/utils";

interface ComparisonTableBlockProps {
	block: ContentBlock;
}

export function ComparisonTableBlock({ block }: ComparisonTableBlockProps) {
	if (
		!block.comparisonColumns ||
		block.comparisonColumns.length === 0 ||
		!block.comparisonRows ||
		block.comparisonRows.length === 0
	) {
		return null;
	}

	const highlightIdx = block.highlightColumn ?? -1;

	return (
		<div className="not-prose my-6 overflow-x-auto">
			<table className="w-full border-collapse text-sm" aria-label="Feature comparison">
				<thead>
					<tr className="border-b border-border">
						<th className="px-4 py-3 text-left font-semibold">Feature</th>
						{block.comparisonColumns.map((col, i) => (
							<th
								key={i}
								className={cn(
									"px-4 py-3 text-center font-semibold",
									i === highlightIdx && "bg-primary text-primary-foreground",
								)}
							>
								{col}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{block.comparisonRows.map((row, i) => (
						<tr key={i} className="border-b border-border">
							<td className="px-4 py-3 font-medium">{row.feature}</td>
							{row.values.map((value, j) => (
								<td
									key={j}
									className={cn(
										"px-4 py-3 text-center",
										j === highlightIdx && "bg-primary/5",
									)}
								>
									{typeof value === "boolean" ? (
										value ? (
											<span className="text-green-600 dark:text-green-400" aria-label="Yes">
												&#10003;
											</span>
										) : (
											<span className="text-muted-foreground" aria-label="No">
												&#10005;
											</span>
										)
									) : (
										value
									)}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
