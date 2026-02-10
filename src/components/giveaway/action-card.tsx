"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ActionCardProps {
	email: string;
	action: string;
	label: string;
	bonusEntries: number;
	completed: boolean;
	onCompleted?: () => void;
}

export function ActionCard({
	email,
	action,
	label,
	bonusEntries,
	completed,
	onCompleted,
}: ActionCardProps) {
	const [isCompleted, setIsCompleted] = useState(completed);
	const [isLoading, setIsLoading] = useState(false);

	async function handleClick() {
		if (isCompleted || isLoading) return;

		setIsLoading(true);

		try {
			const res = await fetch("/api/giveaway/action", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, action }),
			});

			if (res.ok) {
				setIsCompleted(true);
				onCompleted?.();
			}
		} catch {
			// Silently fail — user can retry
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<Card
			className={cn(
				"transition-colors",
				isCompleted && "border-green-500/50 bg-green-50 dark:bg-green-950/20",
			)}
		>
			<CardContent className="flex items-center justify-between py-3">
				<div className="space-y-0.5">
					<p className="text-sm font-medium">{label}</p>
					<p className="text-xs text-muted-foreground">
						+{bonusEntries} bonus {bonusEntries === 1 ? "entry" : "entries"}
					</p>
				</div>

				{isCompleted ? (
					<div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500 text-white">
						<Check className="h-4 w-4" />
						<span className="sr-only">Completed</span>
					</div>
				) : (
					<Button
						size="sm"
						variant="outline"
						onClick={handleClick}
						disabled={isLoading}
					>
						{isLoading ? "..." : "Complete"}
					</Button>
				)}
			</CardContent>
		</Card>
	);
}
