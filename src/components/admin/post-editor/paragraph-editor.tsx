"use client";

import type { ContentBlock } from "@/types/content";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { isSafeUrl } from "@/lib/utils";

interface ParagraphEditorProps {
	block: ContentBlock;
	onChange: (block: ContentBlock) => void;
}

export function ParagraphEditor({ block, onChange }: ParagraphEditorProps) {
	return (
		<div className="space-y-3">
			<div className="space-y-2">
				<Label>Text</Label>
				<Textarea
					value={block.text ?? ""}
					onChange={(e) => onChange({ ...block, text: e.target.value })}
					placeholder="Paragraph text..."
					className="min-h-[80px]"
				/>
			</div>

			<div className="space-y-2">
				<Label>Link URL (optional)</Label>
				<Input
					value={block.link ?? ""}
					onChange={(e) => onChange({ ...block, link: e.target.value })}
					placeholder="https://..."
				/>
				{block.link && !isSafeUrl(block.link) && (
					<p className="text-xs text-destructive">Unsafe URL protocol</p>
				)}
			</div>

			<div className="space-y-2">
				<Label>Link Text (optional)</Label>
				<Input
					value={block.linkText ?? ""}
					onChange={(e) => onChange({ ...block, linkText: e.target.value })}
					placeholder="Click here"
				/>
			</div>
		</div>
	);
}
