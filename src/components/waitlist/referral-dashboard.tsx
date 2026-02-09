"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface ReferralData {
	position: number;
	referralCount: number;
}

interface ReferralDashboardProps {
	code: string;
}

export function ReferralDashboard({ code }: ReferralDashboardProps) {
	const [data, setData] = useState<ReferralData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");
	const [copied, setCopied] = useState(false);

	const referralLink =
		typeof window !== "undefined"
			? `${window.location.origin}/waitlist?ref=${code}`
			: "";

	useEffect(() => {
		async function fetchData() {
			try {
				const res = await fetch(`/api/waitlist/${code}`);
				if (!res.ok) {
					setError("Could not load your referral data.");
					return;
				}
				const json = (await res.json()) as ReferralData;
				setData(json);
			} catch {
				setError("Could not load your referral data.");
			} finally {
				setIsLoading(false);
			}
		}

		fetchData();
	}, [code]);

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(referralLink);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// Fallback: select the input text
		}
	}

	function handleTwitterShare() {
		const text = encodeURIComponent(
			"I just joined the waitlist! Join me and move up the list:",
		);
		const url = encodeURIComponent(referralLink);
		window.open(
			`https://twitter.com/intent/tweet?text=${text}&url=${url}`,
			"_blank",
			"noopener,noreferrer",
		);
	}

	if (isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-24 w-full" />
				<Skeleton className="h-24 w-full" />
				<Skeleton className="h-12 w-full" />
			</div>
		);
	}

	if (error) {
		return <p className="text-sm text-destructive">{error}</p>;
	}

	if (!data) {
		return null;
	}

	return (
		<div className="space-y-6">
			<div className="grid gap-4 sm:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Your Position
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-bold">#{data.position}</p>
						<p className="text-sm text-muted-foreground">on the waiting list</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Referrals
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-bold">{data.referralCount}</p>
						<p className="text-sm text-muted-foreground">
							{data.referralCount === 1 ? "person" : "people"} referred
						</p>
					</CardContent>
				</Card>
			</div>

			<div className="space-y-2">
				<p className="text-sm font-medium">Share your referral link</p>
				<div className="flex gap-2">
					<Input value={referralLink} readOnly className="flex-1" />
					<Button
						variant="outline"
						size="icon"
						onClick={handleCopy}
						aria-label="Copy referral link"
					>
						{copied ? (
							<Check className="h-4 w-4" />
						) : (
							<Copy className="h-4 w-4" />
						)}
					</Button>
				</div>
			</div>

			<Button variant="outline" className="w-full" onClick={handleTwitterShare}>
				<Twitter className="mr-2 h-4 w-4" />
				Share on Twitter
			</Button>
		</div>
	);
}
