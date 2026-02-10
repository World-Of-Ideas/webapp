"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SearchTrigger() {
	function handleClick() {
		document.dispatchEvent(new CustomEvent("open-search"));
	}

	return (
		<Button
			variant="ghost"
			size="icon"
			className="hidden md:flex"
			aria-label="Search"
			id="search-trigger"
			onClick={handleClick}
		>
			<Search className="h-4 w-4" />
			<span className="sr-only">Search (⌘K)</span>
		</Button>
	);
}
