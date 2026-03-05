"use client";

import type { ContentBlock } from "@/types/content";
import { Label } from "@/components/ui/label";

interface SpacerEditorProps {
	block: ContentBlock;
	onChange: (block: ContentBlock) => void;
}

export function SpacerEditor({ block, onChange }: SpacerEditorProps) {
	return (
		<div className="space-y-2">
			<Label>Size</Label>
			<select
				value={block.spacerSize ?? "md"}
				onChange={(e) =>
					onChange({
						...block,
						spacerSize: e.target.value as "sm" | "md" | "lg" | "xl",
					})
				}
				className="w-full rounded-md border bg-background px-3 py-2 text-sm"
				aria-label="Spacer size"
			>
				<option value="sm">Small (16px)</option>
				<option value="md">Medium (32px)</option>
				<option value="lg">Large (64px)</option>
				<option value="xl">Extra Large (96px)</option>
			</select>
		</div>
	);
}
