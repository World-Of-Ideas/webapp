"use client";

import { useState, useRef, useCallback } from "react";
import type { ContentBlock } from "@/types/content";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
	block: ContentBlock;
}

export function CodeBlock({ block }: CodeBlockProps) {
	const [copied, setCopied] = useState(false);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const handleCopy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(block.code ?? "");
			setCopied(true);
			if (timerRef.current) clearTimeout(timerRef.current);
			timerRef.current = setTimeout(() => setCopied(false), 2000);
		} catch {
			// Clipboard API may not be available
		}
	}, [block.code]);

	if (!block.code) return null;

	return (
		<div className="not-prose relative my-6 overflow-hidden rounded-lg border border-border bg-muted">
			<div className="flex items-center justify-between border-b border-border px-4 py-2">
				<span className="text-xs font-medium text-muted-foreground">
					{block.language || "plaintext"}
				</span>
				<button
					type="button"
					onClick={handleCopy}
					className={cn(
						"rounded px-2 py-1 text-xs font-medium transition-colors",
						copied
							? "text-green-600 dark:text-green-400"
							: "text-muted-foreground hover:text-foreground",
					)}
					aria-label={copied ? "Copied" : "Copy code"}
				>
					{copied ? "Copied!" : "Copy"}
				</button>
			</div>
			<pre className="overflow-x-auto p-4">
				<code className="text-sm leading-relaxed">{block.code}</code>
			</pre>
		</div>
	);
}
