"use client";

import { useState } from "react";
import type { ContentBlock } from "@/types/content";
import { cn } from "@/lib/utils";

interface AccordionBlockProps {
	block: ContentBlock;
}

export function AccordionBlock({ block }: AccordionBlockProps) {
	const [openItems, setOpenItems] = useState<number[]>([]);

	if (!block.accordionItems || block.accordionItems.length === 0) return null;

	const toggle = (index: number) => {
		setOpenItems((prev) =>
			prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
		);
	};

	return (
		<div className="not-prose my-6 divide-y divide-border rounded-lg border border-border">
			{block.accordionItems.map((item, i) => {
				const isOpen = openItems.includes(i);
				const panelId = `accordion-panel-${i}`;
				const triggerId = `accordion-trigger-${i}`;

				return (
					<div key={i}>
						<button
							type="button"
							id={triggerId}
							onClick={() => toggle(i)}
							className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-foreground hover:bg-muted/50"
							aria-expanded={isOpen}
							aria-controls={panelId}
						>
							<span>{item.title}</span>
							<svg
								className={cn(
									"h-4 w-4 shrink-0 text-muted-foreground transition-transform",
									isOpen && "rotate-180",
								)}
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
							</svg>
						</button>
						{isOpen && (
							<div
								id={panelId}
								role="region"
								aria-labelledby={triggerId}
								className="px-4 pb-3 text-sm text-muted-foreground"
							>
								{item.content}
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}
