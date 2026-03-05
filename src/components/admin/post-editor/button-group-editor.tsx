"use client";

import type { ContentBlock } from "@/types/content";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ButtonGroupEditorProps {
	block: ContentBlock;
	onChange: (block: ContentBlock) => void;
}

export function ButtonGroupEditor({ block, onChange }: ButtonGroupEditorProps) {
	const buttons = block.buttons ?? [];

	function updateButton(
		index: number,
		field: "label" | "href" | "variant",
		value: string,
	) {
		const updated = buttons.map((btn, i) =>
			i === index ? { ...btn, [field]: value } : btn,
		);
		onChange({ ...block, buttons: updated });
	}

	function addButton() {
		onChange({
			...block,
			buttons: [
				...buttons,
				{ label: "", href: "", variant: "primary" as const },
			],
		});
	}

	function removeButton(index: number) {
		onChange({ ...block, buttons: buttons.filter((_, i) => i !== index) });
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<Label>Buttons</Label>
				<Button type="button" variant="outline" size="sm" onClick={addButton}>
					Add Button
				</Button>
			</div>

			<div className="space-y-3">
				{buttons.map((btn, i) => (
					<div key={i} className="flex items-start gap-2 rounded-md border p-3">
						<div className="flex-1 space-y-2">
							<Input
								value={btn.label}
								onChange={(e) => updateButton(i, "label", e.target.value)}
								placeholder="Button label"
							/>
							<Input
								value={btn.href}
								onChange={(e) => updateButton(i, "href", e.target.value)}
								placeholder="Button URL"
							/>
							<select
								value={btn.variant}
								onChange={(e) => updateButton(i, "variant", e.target.value)}
								className="w-full rounded-md border bg-background px-3 py-2 text-sm"
								aria-label="Button variant"
							>
								<option value="primary">Primary</option>
								<option value="outline">Outline</option>
								<option value="link">Link</option>
							</select>
						</div>
						<Button
							type="button"
							variant="ghost"
							size="icon-xs"
							onClick={() => removeButton(i)}
						>
							&times;
						</Button>
					</div>
				))}
			</div>
		</div>
	);
}
