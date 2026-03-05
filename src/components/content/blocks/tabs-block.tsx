"use client";

import { useState } from "react";
import type { ContentBlock } from "@/types/content";
import { cn } from "@/lib/utils";

interface TabsBlockProps {
	block: ContentBlock;
}

export function TabsBlock({ block }: TabsBlockProps) {
	const [activeTab, setActiveTab] = useState(0);

	if (!block.tabs || block.tabs.length === 0) return null;

	return (
		<div className="my-6 rounded-lg border border-border">
			<div role="tablist" className="flex border-b border-border">
				{block.tabs.map((tab, i) => {
					const isActive = i === activeTab;
					const tabId = `tab-${i}`;
					const panelId = `tabpanel-${i}`;
					return (
						<button
							key={i}
							type="button"
							role="tab"
							id={tabId}
							aria-selected={isActive}
							aria-controls={panelId}
							tabIndex={isActive ? 0 : -1}
							onClick={() => setActiveTab(i)}
							className={cn(
								"px-4 py-2.5 text-sm font-medium transition-colors",
								isActive
									? "border-b-2 border-primary text-foreground"
									: "text-muted-foreground hover:text-foreground",
							)}
						>
							{tab.label}
						</button>
					);
				})}
			</div>
			<div
				role="tabpanel"
				id={`tabpanel-${activeTab}`}
				aria-labelledby={`tab-${activeTab}`}
				className="p-4 text-sm text-foreground sm:text-base"
			>
				{block.tabs[activeTab].content}
			</div>
		</div>
	);
}
