"use client";

import type { ContentBlock } from "@/types/content";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface EmbedEditorProps {
	block: ContentBlock;
	onChange: (block: ContentBlock) => void;
}

export function EmbedEditor({ block, onChange }: EmbedEditorProps) {
	return (
		<div className="space-y-3">
			<div className="space-y-2">
				<Label>Embed URL</Label>
				<Input
					value={block.embedUrl ?? ""}
					onChange={(e) => onChange({ ...block, embedUrl: e.target.value })}
					placeholder="https://..."
				/>
			</div>
			<div className="space-y-2">
				<Label>Height (px)</Label>
				<Input
					type="number"
					value={block.embedHeight ?? ""}
					onChange={(e) =>
						onChange({
							...block,
							embedHeight: e.target.value ? Number(e.target.value) : undefined,
						})
					}
					placeholder="400"
				/>
			</div>
			<div className="space-y-2">
				<Label>Title (for accessibility)</Label>
				<Input
					value={block.text ?? ""}
					onChange={(e) => onChange({ ...block, text: e.target.value })}
					placeholder="Title for accessibility"
				/>
			</div>
		</div>
	);
}
