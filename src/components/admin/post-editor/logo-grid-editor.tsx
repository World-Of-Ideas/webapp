"use client";

import type { ContentBlock } from "@/types/content";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface LogoGridEditorProps {
	block: ContentBlock;
	onChange: (block: ContentBlock) => void;
}

export function LogoGridEditor({ block, onChange }: LogoGridEditorProps) {
	const logos = block.logos ?? [];

	function updateLogo(
		index: number,
		field: "image" | "alt" | "href",
		value: string,
	) {
		const updated = logos.map((logo, i) =>
			i === index ? { ...logo, [field]: value } : logo,
		);
		onChange({ ...block, logos: updated });
	}

	function addLogo() {
		onChange({
			...block,
			logos: [...logos, { image: "", alt: "" }],
		});
	}

	function removeLogo(index: number) {
		onChange({ ...block, logos: logos.filter((_, i) => i !== index) });
	}

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label>Columns</Label>
				<select
					value={String(block.columns ?? 4)}
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
				<Label>Logos</Label>
				<Button type="button" variant="outline" size="sm" onClick={addLogo}>
					Add Logo
				</Button>
			</div>

			<div className="space-y-3">
				{logos.map((logo, i) => (
					<div key={i} className="flex items-start gap-2 rounded-md border p-3">
						<div className="flex-1 space-y-2">
							<Input
								value={logo.image}
								onChange={(e) => updateLogo(i, "image", e.target.value)}
								placeholder="Logo image URL"
							/>
							<Input
								value={logo.alt}
								onChange={(e) => updateLogo(i, "alt", e.target.value)}
								placeholder="Alt text"
							/>
							<Input
								value={logo.href ?? ""}
								onChange={(e) => updateLogo(i, "href", e.target.value)}
								placeholder="Link URL (optional)"
							/>
						</div>
						<Button
							type="button"
							variant="ghost"
							size="icon-xs"
							onClick={() => removeLogo(i)}
						>
							&times;
						</Button>
					</div>
				))}
			</div>
		</div>
	);
}
