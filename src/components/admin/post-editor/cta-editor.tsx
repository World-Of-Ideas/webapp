"use client";

import type { ContentBlock } from "@/types/content";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface CtaEditorProps {
	block: ContentBlock;
	onChange: (block: ContentBlock) => void;
}

export function CtaEditor({ block, onChange }: CtaEditorProps) {
	return (
		<div className="space-y-2">
			<Label>CTA Message</Label>
			<Input
				value={block.text ?? ""}
				onChange={(e) => onChange({ ...block, text: e.target.value })}
				placeholder="Custom call-to-action message..."
			/>
		</div>
	);
}
