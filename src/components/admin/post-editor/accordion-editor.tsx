"use client";

import type { ContentBlock } from "@/types/content";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface AccordionEditorProps {
	block: ContentBlock;
	onChange: (block: ContentBlock) => void;
}

export function AccordionEditor({ block, onChange }: AccordionEditorProps) {
	const items = block.accordionItems ?? [];

	function updateItem(index: number, field: "title" | "content", value: string) {
		const updated = items.map((item, i) =>
			i === index ? { ...item, [field]: value } : item,
		);
		onChange({ ...block, accordionItems: updated });
	}

	function addItem() {
		onChange({
			...block,
			accordionItems: [...items, { title: "", content: "" }],
		});
	}

	function removeItem(index: number) {
		onChange({
			...block,
			accordionItems: items.filter((_, i) => i !== index),
		});
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<Label>Accordion Items</Label>
				<Button type="button" variant="outline" size="sm" onClick={addItem}>
					Add Item
				</Button>
			</div>

			<div className="space-y-3">
				{items.map((item, i) => (
					<div key={i} className="flex items-start gap-2 rounded-md border p-3">
						<div className="flex-1 space-y-2">
							<Input
								value={item.title}
								onChange={(e) => updateItem(i, "title", e.target.value)}
								placeholder="Accordion title"
							/>
							<Textarea
								value={item.content}
								onChange={(e) => updateItem(i, "content", e.target.value)}
								placeholder="Accordion content"
								className="min-h-[60px]"
							/>
						</div>
						<Button
							type="button"
							variant="ghost"
							size="icon-xs"
							onClick={() => removeItem(i)}
						>
							&times;
						</Button>
					</div>
				))}
			</div>
		</div>
	);
}
