"use client";

import type { ContentBlock } from "@/types/content";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CodeEditorProps {
	block: ContentBlock;
	onChange: (block: ContentBlock) => void;
}

export function CodeEditor({ block, onChange }: CodeEditorProps) {
	return (
		<div className="space-y-3">
			<div className="space-y-2">
				<Label>Code</Label>
				<Textarea
					value={block.code ?? ""}
					onChange={(e) => onChange({ ...block, code: e.target.value })}
					placeholder="Enter code..."
					className="min-h-[120px] font-mono"
				/>
			</div>
			<div className="space-y-2">
				<Label>Language</Label>
				<Input
					value={block.language ?? ""}
					onChange={(e) => onChange({ ...block, language: e.target.value })}
					placeholder="javascript, python, etc."
				/>
			</div>
		</div>
	);
}
