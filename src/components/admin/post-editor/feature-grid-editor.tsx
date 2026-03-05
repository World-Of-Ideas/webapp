"use client";

import type { ContentBlock } from "@/types/content";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface FeatureGridEditorProps {
	block: ContentBlock;
	onChange: (block: ContentBlock) => void;
}

export function FeatureGridEditor({ block, onChange }: FeatureGridEditorProps) {
	const features = block.features ?? [];

	function updateFeature(
		index: number,
		field: "title" | "description" | "icon",
		value: string,
	) {
		const updated = features.map((f, i) =>
			i === index ? { ...f, [field]: value } : f,
		);
		onChange({ ...block, features: updated });
	}

	function addFeature() {
		onChange({
			...block,
			features: [...features, { title: "", description: "", icon: "" }],
		});
	}

	function removeFeature(index: number) {
		onChange({ ...block, features: features.filter((_, i) => i !== index) });
	}

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label>Columns</Label>
				<select
					value={String(block.columns ?? 3)}
					onChange={(e) =>
						onChange({
							...block,
							columns: Number(e.target.value) as 2 | 3 | 4 | 5 | 6,
						})
					}
					className="w-full rounded-md border bg-background px-3 py-2 text-sm"
					aria-label="Columns"
				>
					<option value="2">2</option>
					<option value="3">3</option>
					<option value="4">4</option>
					<option value="5">5</option>
					<option value="6">6</option>
				</select>
			</div>

			<div className="flex items-center justify-between">
				<Label>Features</Label>
				<Button type="button" variant="outline" size="sm" onClick={addFeature}>
					Add Feature
				</Button>
			</div>

			<div className="space-y-3">
				{features.map((feature, i) => (
					<div key={i} className="flex items-start gap-2 rounded-md border p-3">
						<div className="flex-1 space-y-2">
							<Input
								value={feature.icon ?? ""}
								onChange={(e) => updateFeature(i, "icon", e.target.value)}
								placeholder="emoji or icon text"
							/>
							<Input
								value={feature.title}
								onChange={(e) => updateFeature(i, "title", e.target.value)}
								placeholder="Feature title"
							/>
							<Textarea
								value={feature.description}
								onChange={(e) =>
									updateFeature(i, "description", e.target.value)
								}
								placeholder="Feature description"
								className="min-h-[60px]"
							/>
						</div>
						<Button
							type="button"
							variant="ghost"
							size="icon-xs"
							onClick={() => removeFeature(i)}
						>
							&times;
						</Button>
					</div>
				))}
			</div>
		</div>
	);
}
