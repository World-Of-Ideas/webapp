"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { FileText, Newspaper } from "lucide-react";

interface SearchResult {
	type: "page" | "post";
	title: string;
	description: string | null;
	href: string;
}

export function SearchDialog() {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<{ pages: SearchResult[]; posts: SearchResult[] }>({
		pages: [],
		posts: [],
	});
	const router = useRouter();
	const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
	const abortRef = useRef<AbortController>(undefined);

	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((prev) => !prev);
			}
		};
		document.addEventListener("keydown", down);
		return () => document.removeEventListener("keydown", down);
	}, []);

	useEffect(() => {
		const handleOpenSearch = () => setOpen(true);
		document.addEventListener("open-search", handleOpenSearch);
		return () => document.removeEventListener("open-search", handleOpenSearch);
	}, []);

	const handleSearch = useCallback((value: string) => {
		setQuery(value);
		if (debounceRef.current) {
			clearTimeout(debounceRef.current);
		}
		if (abortRef.current) {
			abortRef.current.abort();
		}
		if (value.length < 2) {
			setResults({ pages: [], posts: [] });
			return;
		}

		debounceRef.current = setTimeout(async () => {
			const controller = new AbortController();
			abortRef.current = controller;

			try {
				const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`, {
					signal: controller.signal,
				});
				if (res.ok) {
					const data = (await res.json()) as { data?: { pages: SearchResult[]; posts: SearchResult[] } };
					setResults(data.data ?? { pages: [], posts: [] });
				}
			} catch {
				// silently fail on search errors or aborted requests
			}
		}, 300);
	}, []);

	const handleSelect = useCallback(
		(href: string) => {
			setOpen(false);
			setQuery("");
			setResults({ pages: [], posts: [] });
			router.push(href);
		},
		[router],
	);

	return (
		<CommandDialog open={open} onOpenChange={setOpen}>
			<CommandInput placeholder="Search pages and posts..." value={query} onValueChange={handleSearch} />
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>
				{results.pages.length > 0 && (
					<CommandGroup heading="Pages">
						{results.pages.map((result) => (
							<CommandItem key={result.href} onSelect={() => handleSelect(result.href)}>
								<FileText className="mr-2 h-4 w-4" />
								<div>
									<p className="font-medium">{result.title}</p>
									{result.description && (
										<p className="text-xs text-muted-foreground line-clamp-1">{result.description}</p>
									)}
								</div>
							</CommandItem>
						))}
					</CommandGroup>
				)}
				{results.posts.length > 0 && (
					<CommandGroup heading="Blog Posts">
						{results.posts.map((result) => (
							<CommandItem key={result.href} onSelect={() => handleSelect(result.href)}>
								<Newspaper className="mr-2 h-4 w-4" />
								<div>
									<p className="font-medium">{result.title}</p>
									{result.description && (
										<p className="text-xs text-muted-foreground line-clamp-1">{result.description}</p>
									)}
								</div>
							</CommandItem>
						))}
					</CommandGroup>
				)}
			</CommandList>
		</CommandDialog>
	);
}
