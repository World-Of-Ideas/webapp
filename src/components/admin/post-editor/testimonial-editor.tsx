"use client";

import type { ContentBlock } from "@/types/content";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface TestimonialEditorProps {
	block: ContentBlock;
	onChange: (block: ContentBlock) => void;
}

export function TestimonialEditor({ block, onChange }: TestimonialEditorProps) {
	return (
		<div className="space-y-3">
			<div className="space-y-2">
				<Label>Quote</Label>
				<Textarea
					value={block.text ?? ""}
					onChange={(e) => onChange({ ...block, text: e.target.value })}
					placeholder="What did they say?"
					className="min-h-[80px]"
				/>
			</div>
			<div className="grid gap-3 sm:grid-cols-2">
				<div className="space-y-2">
					<Label>Name</Label>
					<Input
						value={block.author ?? ""}
						onChange={(e) => onChange({ ...block, author: e.target.value })}
						placeholder="John Doe"
					/>
				</div>
				<div className="space-y-2">
					<Label>Role</Label>
					<Input
						value={block.role ?? ""}
						onChange={(e) => onChange({ ...block, role: e.target.value })}
						placeholder="CEO"
					/>
				</div>
				<div className="space-y-2">
					<Label>Company</Label>
					<Input
						value={block.company ?? ""}
						onChange={(e) => onChange({ ...block, company: e.target.value })}
						placeholder="Acme Inc."
					/>
				</div>
				<div className="space-y-2">
					<Label>Avatar URL</Label>
					<Input
						value={block.avatarUrl ?? ""}
						onChange={(e) => onChange({ ...block, avatarUrl: e.target.value })}
						placeholder="https://..."
					/>
				</div>
			</div>
		</div>
	);
}
