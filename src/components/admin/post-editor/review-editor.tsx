"use client";

import type { ContentBlock } from "@/types/content";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ReviewEditorProps {
	block: ContentBlock;
	onChange: (block: ContentBlock) => void;
}

export function ReviewEditor({ block, onChange }: ReviewEditorProps) {
	return (
		<div className="space-y-3">
			<div className="space-y-2">
				<Label>Rating</Label>
				<select
					value={block.rating ?? 5}
					onChange={(e) => onChange({ ...block, rating: Number(e.target.value) as 1 | 2 | 3 | 4 | 5 })}
					className="w-full rounded-md border bg-background px-3 py-2 text-sm"
					aria-label="Rating"
				>
					<option value={1}>1 Star</option>
					<option value={2}>2 Stars</option>
					<option value={3}>3 Stars</option>
					<option value={4}>4 Stars</option>
					<option value={5}>5 Stars</option>
				</select>
			</div>
			<div className="space-y-2">
				<Label>Quote</Label>
				<Textarea
					value={block.text ?? ""}
					onChange={(e) => onChange({ ...block, text: e.target.value })}
					placeholder="Review text"
					className="min-h-[80px]"
				/>
			</div>
			<div className="grid gap-3 sm:grid-cols-2">
				<div className="space-y-2">
					<Label>Author</Label>
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
