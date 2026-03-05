"use client";

import type { ContentBlock } from "@/types/content";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface EmailCaptureEditorProps {
	block: ContentBlock;
	onChange: (block: ContentBlock) => void;
}

export function EmailCaptureEditor({ block, onChange }: EmailCaptureEditorProps) {
	return (
		<div className="space-y-3">
			<div className="space-y-2">
				<Label>Heading</Label>
				<Input
					value={block.emailCaptureHeading ?? ""}
					onChange={(e) => onChange({ ...block, emailCaptureHeading: e.target.value })}
					placeholder="Stay updated"
				/>
			</div>
			<div className="space-y-2">
				<Label>Placeholder</Label>
				<Input
					value={block.emailCapturePlaceholder ?? ""}
					onChange={(e) => onChange({ ...block, emailCapturePlaceholder: e.target.value })}
					placeholder="Enter your email"
				/>
			</div>
			<div className="space-y-2">
				<Label>Button Text</Label>
				<Input
					value={block.emailCaptureButtonText ?? ""}
					onChange={(e) => onChange({ ...block, emailCaptureButtonText: e.target.value })}
					placeholder="Subscribe"
				/>
			</div>
		</div>
	);
}
