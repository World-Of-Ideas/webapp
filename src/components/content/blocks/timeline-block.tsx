import type { ContentBlock } from "@/types/content";

interface TimelineBlockProps {
	block: ContentBlock;
}

export function TimelineBlock({ block }: TimelineBlockProps) {
	if (!block.timelineEvents || block.timelineEvents.length === 0) return null;

	return (
		<div className="not-prose my-6">
			<div className="relative space-y-6 pl-8">
				{/* Vertical line */}
				<div className="absolute left-3 top-1 bottom-1 w-px bg-border" aria-hidden="true" />

				{block.timelineEvents.map((event, i) => (
					<div key={i} className="relative">
						{/* Dot */}
						<div
							className="absolute -left-8 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-primary bg-background"
							aria-hidden="true"
						/>
						{event.date && (
							<p className="text-sm text-muted-foreground">{event.date}</p>
						)}
						{event.title && (
							<p className="font-semibold text-foreground">{event.title}</p>
						)}
						{event.description && (
							<p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
