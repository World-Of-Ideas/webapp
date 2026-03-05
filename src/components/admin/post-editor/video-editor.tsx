"use client";

import type { ContentBlock } from "@/types/content";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface VideoEditorProps {
	block: ContentBlock;
	onChange: (block: ContentBlock) => void;
}

export function VideoEditor({ block, onChange }: VideoEditorProps) {
	return (
		<div className="space-y-3">
			<div className="space-y-2">
				<Label>Video URL (YouTube or Vimeo)</Label>
				<Input
					value={block.videoUrl ?? ""}
					onChange={(e) => onChange({ ...block, videoUrl: e.target.value })}
					placeholder="https://www.youtube.com/watch?v=..."
				/>
			</div>
			<div className="space-y-2">
				<Label>Title (for accessibility)</Label>
				<Input
					value={block.text ?? ""}
					onChange={(e) => onChange({ ...block, text: e.target.value })}
					placeholder="Video title..."
				/>
			</div>
		</div>
	);
}
