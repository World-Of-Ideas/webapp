"use client";

import type { ContentBlock } from "@/types/content";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface HeadingEditorProps {
	block: ContentBlock;
	onChange: (block: ContentBlock) => void;
}

export function HeadingEditor({ block, onChange }: HeadingEditorProps) {
	return (
		<div className="space-y-3">
			<div className="space-y-2">
				<Label>Heading Text</Label>
				<Input
					value={block.text ?? ""}
					onChange={(e) => onChange({ ...block, text: e.target.value })}
					placeholder="Heading text..."
				/>
			</div>

			<div className="space-y-2">
				<Label>Level</Label>
				<Select
					value={String(block.level ?? 2)}
					onValueChange={(val) =>
						onChange({ ...block, level: Number(val) as 2 | 3 | 4 })
					}
				>
					<SelectTrigger className="w-full">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="2">H2</SelectItem>
						<SelectItem value="3">H3</SelectItem>
						<SelectItem value="4">H4</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}
