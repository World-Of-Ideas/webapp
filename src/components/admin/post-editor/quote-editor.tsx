"use client";

import type { ContentBlock } from "@/types/content";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface QuoteEditorProps {
	block: ContentBlock;
	onChange: (block: ContentBlock) => void;
}

export function QuoteEditor({ block, onChange }: QuoteEditorProps) {
	return (
		<div className="space-y-2">
			<Label>Quote Text</Label>
			<Textarea
				value={block.text ?? ""}
				onChange={(e) => onChange({ ...block, text: e.target.value })}
				placeholder="Quote text..."
				className="min-h-[80px]"
			/>
		</div>
	);
}
