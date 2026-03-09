"use client";

import { useState } from "react";
import type { ContentBlock, ContentBlockType } from "@/types/content";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { BlockEditor } from "./block-editor";

interface BlockListProps {
	blocks: ContentBlock[];
	onChange: (blocks: ContentBlock[]) => void;
}

const BLOCK_TYPES: { type: ContentBlockType; label: string }[] = [
	{ type: "paragraph", label: "Paragraph" },
	{ type: "heading", label: "Heading" },
	{ type: "list", label: "List" },
	{ type: "image", label: "Image" },
	{ type: "callout", label: "Callout" },
	{ type: "quote", label: "Quote" },
	{ type: "table", label: "Table" },
	{ type: "cta", label: "CTA" },
	{ type: "download", label: "Download" },
	{ type: "video", label: "Video" },
	{ type: "testimonial", label: "Testimonial" },
	{ type: "code", label: "Code" },
	{ type: "buttonGroup", label: "Button Group" },
	{ type: "featureGrid", label: "Feature Grid" },
	{ type: "logoGrid", label: "Logo Grid" },
	{ type: "statsCounter", label: "Stats Counter" },
	{ type: "divider", label: "Divider" },
	{ type: "accordion", label: "Accordion" },
	{ type: "imageGallery", label: "Image Gallery" },
	{ type: "embed", label: "Embed" },
	{ type: "banner", label: "Banner" },
	{ type: "comparisonTable", label: "Comparison Table" },
	{ type: "timeline", label: "Timeline" },
	{ type: "spacer", label: "Spacer" },
	{ type: "tabs", label: "Tabs" },
	{ type: "review", label: "Review" },
	{ type: "emailCapture", label: "Email Capture" },
	{ type: "tableOfContents", label: "Table of Contents" },
];

function getDefaultBlock(type: ContentBlockType): ContentBlock {
	switch (type) {
		case "paragraph":
			return { type: "paragraph", text: "" };
		case "heading":
			return { type: "heading", text: "", level: 2 };
		case "list":
			return { type: "list", items: [""], ordered: false };
		case "image":
			return { type: "image", image: "", alt: "" };
		case "callout":
			return { type: "callout", text: "", variant: "info" };
		case "quote":
			return { type: "quote", text: "" };
		case "table":
			return { type: "table", headers: ["Column 1"], rows: [[""]] };
		case "cta":
			return { type: "cta", text: "" };
		case "download":
			return { type: "download", downloadUrl: "", downloadLabel: "" };
		case "video":
			return { type: "video", videoUrl: "", text: "" };
		case "testimonial":
			return { type: "testimonial", text: "", author: "", role: "", company: "" };
		case "code":
			return { type: "code", code: "", language: "" };
		case "buttonGroup":
			return { type: "buttonGroup", buttons: [{ label: "", href: "", variant: "primary" }] };
		case "featureGrid":
			return { type: "featureGrid", features: [{ title: "", description: "" }], columns: 3 };
		case "logoGrid":
			return { type: "logoGrid", logos: [{ image: "", alt: "" }], columns: 4 };
		case "statsCounter":
			return { type: "statsCounter", stats: [{ value: "", label: "" }], columns: 3 };
		case "divider":
			return { type: "divider", dividerStyle: "line" };
		case "accordion":
			return { type: "accordion", accordionItems: [{ title: "", content: "" }] };
		case "imageGallery":
			return { type: "imageGallery", gallery: [{ url: "", alt: "" }], columns: 3 };
		case "embed":
			return { type: "embed", embedUrl: "", embedHeight: 400 };
		case "banner":
			return { type: "banner", text: "", bannerVariant: "gradient" };
		case "comparisonTable":
			return { type: "comparisonTable", comparisonColumns: ["Us", "Others"], comparisonRows: [{ feature: "", values: ["", ""] }] };
		case "timeline":
			return { type: "timeline", timelineEvents: [{ date: "", title: "", description: "" }] };
		case "spacer":
			return { type: "spacer", spacerSize: "md" };
		case "tabs":
			return { type: "tabs", tabs: [{ label: "Tab 1", content: "" }] };
		case "review":
			return { type: "review", text: "", rating: 5, author: "" };
		case "emailCapture":
			return { type: "emailCapture", emailCaptureHeading: "Stay updated", emailCapturePlaceholder: "Enter your email", emailCaptureButtonText: "Subscribe" };
		case "tableOfContents":
			return { type: "tableOfContents", tocTitle: "Table of Contents", tocMaxLevel: 3 };
	}
}

const VALID_BLOCK_TYPES = new Set<string>(BLOCK_TYPES.map((bt) => bt.type));

function validateBlocksJson(json: string): { blocks: ContentBlock[]; error: string | null } {
	let parsed: unknown;
	try {
		parsed = JSON.parse(json);
	} catch {
		return { blocks: [], error: "Invalid JSON. Please check the syntax." };
	}
	if (!Array.isArray(parsed)) {
		return { blocks: [], error: "JSON must be an array of content blocks." };
	}
	if (parsed.length === 0) {
		return { blocks: [], error: "Array is empty. Add at least one block." };
	}
	if (parsed.length > 200) {
		return { blocks: [], error: "Too many blocks (max 200)." };
	}
	for (let i = 0; i < parsed.length; i++) {
		const item = parsed[i];
		if (!item || typeof item !== "object" || Array.isArray(item)) {
			return { blocks: [], error: `Item ${i + 1} is not a valid object.` };
		}
		const block = item as Record<string, unknown>;
		if (typeof block.type !== "string" || !VALID_BLOCK_TYPES.has(block.type)) {
			return { blocks: [], error: `Item ${i + 1} has invalid type "${String(block.type)}". Valid types: ${[...VALID_BLOCK_TYPES].join(", ")}` };
		}
	}
	return { blocks: parsed as ContentBlock[], error: null };
}

export function BlockList({ blocks, onChange }: BlockListProps) {
	const [importOpen, setImportOpen] = useState(false);
	const [importJson, setImportJson] = useState("");
	const [importError, setImportError] = useState("");
	const [importMode, setImportMode] = useState<"replace" | "append">("replace");
	const [copyFeedback, setCopyFeedback] = useState(false);

	function updateBlock(index: number, block: ContentBlock) {
		const updated = [...blocks];
		updated[index] = block;
		onChange(updated);
	}

	function moveBlock(index: number, direction: -1 | 1) {
		const target = index + direction;
		if (target < 0 || target >= blocks.length) return;
		const updated = [...blocks];
		[updated[index], updated[target]] = [updated[target], updated[index]];
		onChange(updated);
	}

	function deleteBlock(index: number) {
		const updated = blocks.filter((_, i) => i !== index);
		onChange(updated);
	}

	function addBlock(type: ContentBlockType) {
		onChange([...blocks, getDefaultBlock(type)]);
	}

	function handleExport() {
		const json = JSON.stringify(blocks, null, 2);
		navigator.clipboard.writeText(json).then(() => {
			setCopyFeedback(true);
			setTimeout(() => setCopyFeedback(false), 2000);
		});
	}

	function handleImport() {
		setImportError("");
		const { blocks: parsed, error } = validateBlocksJson(importJson);
		if (error) {
			setImportError(error);
			return;
		}
		if (importMode === "append") {
			onChange([...blocks, ...parsed]);
		} else {
			onChange(parsed);
		}
		setImportJson("");
		setImportOpen(false);
	}

	return (
		<div className="space-y-4">
			{blocks.map((block, i) => (
				<div key={i} className="rounded-lg border p-4 space-y-3">
					<div className="flex items-center justify-between">
						<Badge variant="secondary">{block.type}</Badge>
						<div className="flex items-center gap-1">
							<Button
								type="button"
								variant="ghost"
								size="icon-xs"
								onClick={() => moveBlock(i, -1)}
								disabled={i === 0}
								title="Move up"
								aria-label="Move block up"
							>
								&#8593;
							</Button>
							<Button
								type="button"
								variant="ghost"
								size="icon-xs"
								onClick={() => moveBlock(i, 1)}
								disabled={i === blocks.length - 1}
								title="Move down"
								aria-label="Move block down"
							>
								&#8595;
							</Button>
							<Button
								type="button"
								variant="ghost"
								size="icon-xs"
								onClick={() => deleteBlock(i)}
								title="Delete block"
								aria-label="Remove block"
							>
								&times;
							</Button>
						</div>
					</div>
					<BlockEditor
						block={block}
						onChange={(updated) => updateBlock(i, updated)}
					/>
				</div>
			))}

			<div className="flex gap-2">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button type="button" variant="outline" className="flex-1">
							Add Block
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="center">
						{BLOCK_TYPES.map((bt) => (
							<DropdownMenuItem
								key={bt.type}
								onClick={() => addBlock(bt.type)}
							>
								{bt.label}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>

				<Dialog open={importOpen} onOpenChange={(open) => { setImportOpen(open); if (!open) { setImportJson(""); setImportError(""); } }}>
					<DialogTrigger asChild>
						<Button type="button" variant="outline">
							Import JSON
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-2xl">
						<DialogHeader>
							<DialogTitle>Import Content Blocks</DialogTitle>
							<DialogDescription>
								Paste a JSON array of content blocks. See docs/content-blocks-example.json for a complete example with all 28 block types.
							</DialogDescription>
						</DialogHeader>
						<Textarea
							value={importJson}
							onChange={(e) => { setImportJson(e.target.value); setImportError(""); }}
							placeholder='[{"type": "paragraph", "text": "Hello world"}]'
							className="min-h-[300px] font-mono text-xs"
						/>
						{importError && (
							<p className="text-sm text-destructive" role="alert">{importError}</p>
						)}
						<div className="flex items-center gap-4">
							<label className="flex items-center gap-2 text-sm">
								<input
									type="radio"
									name="importMode"
									checked={importMode === "replace"}
									onChange={() => setImportMode("replace")}
								/>
								Replace all blocks
							</label>
							<label className="flex items-center gap-2 text-sm">
								<input
									type="radio"
									name="importMode"
									checked={importMode === "append"}
									onChange={() => setImportMode("append")}
								/>
								Append to existing
							</label>
						</div>
						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => setImportOpen(false)}>
								Cancel
							</Button>
							<Button type="button" onClick={handleImport} disabled={!importJson.trim()}>
								Import
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				<Button type="button" variant="outline" onClick={handleExport} disabled={blocks.length === 0}>
					{copyFeedback ? "Copied!" : "Export JSON"}
				</Button>
			</div>
		</div>
	);
}
