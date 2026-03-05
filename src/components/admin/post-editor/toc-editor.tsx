"use client";

import type { ContentBlock } from "@/types/content";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface TocEditorProps {
	block: ContentBlock;
	onChange: (block: ContentBlock) => void;
}

export function TocEditor({ block, onChange }: TocEditorProps) {
	return (
		<div className="space-y-3">
			<div className="space-y-2">
				<Label>Title</Label>
				<Input
					value={block.tocTitle ?? ""}
					onChange={(e) => onChange({ ...block, tocTitle: e.target.value })}
					placeholder="Table of Contents"
				/>
			</div>
			<div className="space-y-2">
				<Label>Max Heading Level</Label>
				<select
					value={block.tocMaxLevel ?? 3}
					onChange={(e) => onChange({ ...block, tocMaxLevel: Number(e.target.value) as 2 | 3 | 4 })}
					className="w-full rounded-md border bg-background px-3 py-2 text-sm"
					aria-label="Max heading level"
				>
					<option value={2}>H2 only</option>
					<option value={3}>H2 and H3</option>
					<option value={4}>H2, H3, and H4</option>
				</select>
			</div>
		</div>
	);
}
