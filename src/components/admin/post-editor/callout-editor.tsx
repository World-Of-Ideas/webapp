"use client";

import type { ContentBlock } from "@/types/content";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface CalloutEditorProps {
	block: ContentBlock;
	onChange: (block: ContentBlock) => void;
}

export function CalloutEditor({ block, onChange }: CalloutEditorProps) {
	return (
		<div className="space-y-3">
			<div className="space-y-2">
				<Label>Text</Label>
				<Textarea
					value={block.text ?? ""}
					onChange={(e) => onChange({ ...block, text: e.target.value })}
					placeholder="Callout text..."
					className="min-h-[60px]"
				/>
			</div>

			<div className="space-y-2">
				<Label>Variant</Label>
				<Select
					value={block.variant ?? "info"}
					onValueChange={(val) =>
						onChange({
							...block,
							variant: val as "info" | "tip" | "warning",
						})
					}
				>
					<SelectTrigger className="w-full">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="info">Info</SelectItem>
						<SelectItem value="tip">Tip</SelectItem>
						<SelectItem value="warning">Warning</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}
