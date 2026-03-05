import type { ChangelogEntry } from "@/types/content";

interface ChangelogEntriesProps {
	entries: ChangelogEntry[];
}

export function ChangelogEntries({ entries }: ChangelogEntriesProps) {
	const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));

	return (
		<div className="space-y-0">
			{sorted.map((entry, i) => (
				<article
					key={`${entry.date}-${i}`}
					className="relative border-l-2 border-border py-6 pl-6 first:pt-0 last:pb-0"
				>
					<div className="absolute -left-[5px] top-6 first:top-0 h-2 w-2 rounded-full bg-primary" />

					<time className="text-sm font-medium text-muted-foreground">
						{formatDate(entry.date)}
					</time>

					<h2 className="mt-1 text-lg font-semibold">{entry.title}</h2>

					<p className="mt-2 text-sm text-muted-foreground leading-relaxed">
						{entry.description}
					</p>

					{entry.tags.length > 0 && (
						<div className="mt-3 flex flex-wrap gap-1.5">
							{entry.tags.map((tag) => (
								<span
									key={tag}
									className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
								>
									{tag}
								</span>
							))}
						</div>
					)}
				</article>
			))}
		</div>
	);
}

function formatDate(dateStr: string): string {
	const d = new Date(dateStr);
	if (isNaN(d.getTime())) return dateStr;
	return d.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}
