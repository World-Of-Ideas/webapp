"use client";

import type { ContentBlock } from "@/types/content";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface ListEditorProps {
	block: ContentBlock;
	onChange: (block: ContentBlock) => void;
}

export function ListEditor({ block, onChange }: ListEditorProps) {
	const items = block.items ?? [""];

	function updateItem(index: number, value: string) {
		const updated = [...items];
		updated[index] = value;
		onChange({ ...block, items: updated });
	}

	function addItem() {
		onChange({ ...block, items: [...items, ""] });
	}

	function removeItem(index: number) {
		const updated = items.filter((_, i) => i !== index);
		onChange({ ...block, items: updated.length > 0 ? updated : [""] });
	}

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-3">
				<Switch
					checked={block.ordered ?? false}
					onCheckedChange={(checked) =>
						onChange({ ...block, ordered: checked })
					}
				/>
				<Label>Ordered list</Label>
			</div>

			<div className="space-y-2">
				<Label>Items</Label>
				{items.map((item, i) => (
					<div key={i} className="flex items-center gap-2">
						<span className="text-xs text-muted-foreground w-6 text-right">
							{i + 1}.
						</span>
						<Input
							value={item}
							onChange={(e) => updateItem(i, e.target.value)}
							placeholder={`Item ${i + 1}`}
							className="flex-1"
						/>
						<Button
							type="button"
							variant="ghost"
							size="icon-xs"
							onClick={() => removeItem(i)}
							disabled={items.length <= 1}
						>
							&times;
						</Button>
					</div>
				))}
			</div>

			<Button type="button" variant="outline" size="sm" onClick={addItem}>
				Add Item
			</Button>
		</div>
	);
}
