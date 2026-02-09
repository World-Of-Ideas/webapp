"use client";

import { useCallback, useEffect, useState } from "react";
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

	const handleSearch = useCallback(async (value: string) => {
		setQuery(value);
		if (value.length < 2) {
			setResults({ pages: [], posts: [] });
			return;
		}

		try {
			const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`);
			if (res.ok) {
				const data = (await res.json()) as { data?: { pages: SearchResult[]; posts: SearchResult[] } };
				setResults(data.data ?? { pages: [], posts: [] });
			}
		} catch {
			// silently fail on search errors
		}
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
