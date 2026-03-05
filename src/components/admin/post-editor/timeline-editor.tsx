"use client";

import type { ContentBlock } from "@/types/content";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface TimelineEditorProps {
	block: ContentBlock;
	onChange: (block: ContentBlock) => void;
}

export function TimelineEditor({ block, onChange }: TimelineEditorProps) {
	const events = block.timelineEvents ?? [];

	function updateEvent(
		index: number,
		field: "date" | "title" | "description",
		value: string,
	) {
		const updated = events.map((event, i) =>
			i === index ? { ...event, [field]: value } : event,
		);
		onChange({ ...block, timelineEvents: updated });
	}

	function addEvent() {
		onChange({
			...block,
			timelineEvents: [...events, { date: "", title: "", description: "" }],
		});
	}

	function removeEvent(index: number) {
		onChange({
			...block,
			timelineEvents: events.filter((_, i) => i !== index),
		});
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<Label>Timeline Events</Label>
				<Button type="button" variant="outline" size="sm" onClick={addEvent}>
					Add Event
				</Button>
			</div>

			<div className="space-y-3">
				{events.map((event, i) => (
					<div key={i} className="flex items-start gap-2 rounded-md border p-3">
						<div className="flex-1 space-y-2">
							<Input
								type="date"
								value={event.date}
								onChange={(e) => updateEvent(i, "date", e.target.value)}
							/>
							<Input
								value={event.title}
								onChange={(e) => updateEvent(i, "title", e.target.value)}
								placeholder="Event title"
							/>
							<Textarea
								value={event.description}
								onChange={(e) =>
									updateEvent(i, "description", e.target.value)
								}
								placeholder="Event description"
								className="min-h-[60px]"
							/>
						</div>
						<Button
							type="button"
							variant="ghost"
							size="icon-xs"
							onClick={() => removeEvent(i)}
						>
							&times;
						</Button>
					</div>
				))}
			</div>
		</div>
	);
}
