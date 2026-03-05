"use client";

import type { ContentBlock } from "@/types/content";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ImageGalleryEditorProps {
	block: ContentBlock;
	onChange: (block: ContentBlock) => void;
}

export function ImageGalleryEditor({
	block,
	onChange,
}: ImageGalleryEditorProps) {
	const gallery = block.gallery ?? [];

	function updateImage(
		index: number,
		field: "url" | "alt" | "caption",
		value: string,
	) {
		const updated = gallery.map((img, i) =>
			i === index ? { ...img, [field]: value } : img,
		);
		onChange({ ...block, gallery: updated });
	}

	function addImage() {
		onChange({
			...block,
			gallery: [...gallery, { url: "", alt: "" }],
		});
	}

	function removeImage(index: number) {
		onChange({ ...block, gallery: gallery.filter((_, i) => i !== index) });
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
				<Label>Images</Label>
				<Button type="button" variant="outline" size="sm" onClick={addImage}>
					Add Image
				</Button>
			</div>

			<div className="space-y-3">
				{gallery.map((img, i) => (
					<div key={i} className="flex items-start gap-2 rounded-md border p-3">
						<div className="flex-1 space-y-2">
							<Input
								value={img.url}
								onChange={(e) => updateImage(i, "url", e.target.value)}
								placeholder="Image URL"
							/>
							<Input
								value={img.alt}
								onChange={(e) => updateImage(i, "alt", e.target.value)}
								placeholder="Alt text"
							/>
							<Input
								value={img.caption ?? ""}
								onChange={(e) => updateImage(i, "caption", e.target.value)}
								placeholder="Caption (optional)"
							/>
						</div>
						<Button
							type="button"
							variant="ghost"
							size="icon-xs"
							onClick={() => removeImage(i)}
						>
							&times;
						</Button>
					</div>
				))}
			</div>
		</div>
	);
}
