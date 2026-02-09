"use client";

import type { ContentBlock } from "@/types/content";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/admin/image-upload";

interface ImageEditorProps {
	block: ContentBlock;
	onChange: (block: ContentBlock) => void;
}

export function ImageEditor({ block, onChange }: ImageEditorProps) {
	return (
		<div className="space-y-3">
			<div className="space-y-2">
				<Label>Image</Label>
				<ImageUpload
					value={block.image}
					onChange={(url) => onChange({ ...block, image: url })}
				/>
			</div>

			<div className="space-y-2">
				<Label>Alt Text</Label>
				<Input
					value={block.alt ?? ""}
					onChange={(e) => onChange({ ...block, alt: e.target.value })}
					placeholder="Describe the image..."
				/>
			</div>
		</div>
	);
}
