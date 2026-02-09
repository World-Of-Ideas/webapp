"use client";

import type { RelatedPage } from "@/types/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RelatedPagesEditorProps {
	pages: RelatedPage[];
	onChange: (pages: RelatedPage[]) => void;
}

export function RelatedPagesEditor({ pages, onChange }: RelatedPagesEditorProps) {
	function updatePage(index: number, field: keyof RelatedPage, value: string) {
		const updated = [...pages];
		updated[index] = { ...updated[index], [field]: value };
		onChange(updated);
	}

	function addPage() {
		onChange([...pages, { title: "", description: "", href: "" }]);
	}

	function removePage(index: number) {
		onChange(pages.filter((_, i) => i !== index));
	}

	return (
		<div className="space-y-4">
			{pages.map((page, i) => (
				<div key={i} className="rounded-lg border p-4 space-y-3">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium text-muted-foreground">
							Related Page {i + 1}
						</span>
						<Button
							type="button"
							variant="ghost"
							size="icon-xs"
							onClick={() => removePage(i)}
							title="Remove related page"
						>
							&times;
						</Button>
					</div>

					<div className="space-y-2">
						<Label>Title</Label>
						<Input
							value={page.title}
							onChange={(e) => updatePage(i, "title", e.target.value)}
							placeholder="Page title"
						/>
					</div>

					<div className="space-y-2">
						<Label>Description</Label>
						<Input
							value={page.description}
							onChange={(e) => updatePage(i, "description", e.target.value)}
							placeholder="Brief description"
						/>
					</div>

					<div className="space-y-2">
						<Label>Link (href)</Label>
						<Input
							value={page.href}
							onChange={(e) => updatePage(i, "href", e.target.value)}
							placeholder="/path/to/page"
						/>
					</div>
				</div>
			))}

			<Button type="button" variant="outline" onClick={addPage}>
				Add Related Page
			</Button>
		</div>
	);
}
