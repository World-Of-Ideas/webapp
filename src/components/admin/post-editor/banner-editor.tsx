"use client";

import type { ContentBlock } from "@/types/content";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface BannerEditorProps {
	block: ContentBlock;
	onChange: (block: ContentBlock) => void;
}

export function BannerEditor({ block, onChange }: BannerEditorProps) {
	return (
		<div className="space-y-3">
			<div className="space-y-2">
				<Label>Banner Text</Label>
				<Input
					value={block.text ?? ""}
					onChange={(e) => onChange({ ...block, text: e.target.value })}
					placeholder="Banner text"
				/>
			</div>
			<div className="space-y-2">
				<Label>Button URL</Label>
				<Input
					value={block.link ?? ""}
					onChange={(e) => onChange({ ...block, link: e.target.value })}
					placeholder="Button URL"
				/>
			</div>
			<div className="space-y-2">
				<Label>Button Label</Label>
				<Input
					value={block.linkText ?? ""}
					onChange={(e) => onChange({ ...block, linkText: e.target.value })}
					placeholder="Button label"
				/>
			</div>
			<div className="space-y-2">
				<Label>Variant</Label>
				<select
					value={block.bannerVariant ?? "gradient"}
					onChange={(e) =>
						onChange({
							...block,
							bannerVariant: e.target.value as "solid" | "gradient" | "image",
						})
					}
					className="w-full rounded-md border bg-background px-3 py-2 text-sm"
					aria-label="Banner variant"
				>
					<option value="solid">Solid</option>
					<option value="gradient">Gradient</option>
					<option value="image">Image</option>
				</select>
			</div>
			<div className="space-y-2">
				<Label>Background</Label>
				<Input
					value={block.bannerBackground ?? ""}
					onChange={(e) =>
						onChange({ ...block, bannerBackground: e.target.value })
					}
					placeholder="#9747ff or image URL"
				/>
			</div>
		</div>
	);
}
