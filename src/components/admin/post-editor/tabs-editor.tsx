"use client";

import type { ContentBlock } from "@/types/content";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface TabsEditorProps {
	block: ContentBlock;
	onChange: (block: ContentBlock) => void;
}

export function TabsEditor({ block, onChange }: TabsEditorProps) {
	const tabs = block.tabs ?? [];

	function updateTab(index: number, field: "label" | "content", value: string) {
		const updated = tabs.map((tab, i) =>
			i === index ? { ...tab, [field]: value } : tab,
		);
		onChange({ ...block, tabs: updated });
	}

	function addTab() {
		onChange({
			...block,
			tabs: [...tabs, { label: "", content: "" }],
		});
	}

	function removeTab(index: number) {
		onChange({
			...block,
			tabs: tabs.filter((_, i) => i !== index),
		});
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<Label>Tabs</Label>
				<Button type="button" variant="outline" size="sm" onClick={addTab}>
					Add Tab
				</Button>
			</div>

			<div className="space-y-3">
				{tabs.map((tab, i) => (
					<div key={i} className="flex items-start gap-2 rounded-md border p-3">
						<div className="flex-1 space-y-2">
							<Input
								value={tab.label}
								onChange={(e) => updateTab(i, "label", e.target.value)}
								placeholder="Tab label"
							/>
							<Textarea
								value={tab.content}
								onChange={(e) => updateTab(i, "content", e.target.value)}
								placeholder="Tab content"
								className="min-h-[60px]"
							/>
						</div>
						<Button
							type="button"
							variant="ghost"
							size="icon-xs"
							onClick={() => removeTab(i)}
						>
							&times;
						</Button>
					</div>
				))}
			</div>
		</div>
	);
}
