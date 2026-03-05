"use client";

import type { ContentBlock } from "@/types/content";
import { Label } from "@/components/ui/label";

interface DividerEditorProps {
	block: ContentBlock;
	onChange: (block: ContentBlock) => void;
}

export function DividerEditor({ block, onChange }: DividerEditorProps) {
	return (
		<div className="space-y-2">
			<Label>Style</Label>
			<select
				value={block.dividerStyle ?? "line"}
				onChange={(e) =>
					onChange({
						...block,
						dividerStyle: e.target.value as "line" | "dots" | "gradient",
					})
				}
				className="w-full rounded-md border bg-background px-3 py-2 text-sm"
				aria-label="Divider style"
			>
				<option value="line">Line</option>
				<option value="dots">Dots</option>
				<option value="gradient">Gradient</option>
			</select>
		</div>
	);
}
