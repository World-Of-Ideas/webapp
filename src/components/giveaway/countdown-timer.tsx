"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
	endDate: string;
}

interface TimeLeft {
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
}

function calculateTimeLeft(endDate: string): TimeLeft | null {
	const difference = new Date(endDate).getTime() - Date.now();

	if (difference <= 0) return null;

	return {
		days: Math.floor(difference / (1000 * 60 * 60 * 24)),
		hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
		minutes: Math.floor((difference / (1000 * 60)) % 60),
		seconds: Math.floor((difference / 1000) % 60),
	};
}

export function CountdownTimer({ endDate }: CountdownTimerProps) {
	// Initialize as null to avoid hydration mismatch (Date.now() differs server vs client)
	const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		setTimeLeft(calculateTimeLeft(endDate));

		const interval = setInterval(() => {
			const remaining = calculateTimeLeft(endDate);
			setTimeLeft(remaining);

			if (!remaining) {
				clearInterval(interval);
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [endDate]);

	if (!mounted) {
		// Show placeholder during SSR/hydration to avoid mismatch
		return (
			<div className="flex justify-center gap-3" role="timer">
				{["Days", "Hours", "Minutes", "Seconds"].map((label) => (
					<div key={label} className="flex flex-col items-center rounded-lg border bg-card p-3 min-w-[4.5rem]">
						<span className="text-2xl font-bold tabular-nums">--</span>
						<span className="text-xs text-muted-foreground">{label}</span>
					</div>
				))}
			</div>
		);
	}

	if (!timeLeft) {
		return (
			<p className="text-center text-lg font-semibold text-muted-foreground">
				Giveaway has ended
			</p>
		);
	}

	const segments = [
		{ value: timeLeft.days, label: "Days" },
		{ value: timeLeft.hours, label: "Hours" },
		{ value: timeLeft.minutes, label: "Minutes" },
		{ value: timeLeft.seconds, label: "Seconds" },
	];

	return (
		<div className="flex justify-center gap-3" role="timer">
			{segments.map((segment) => (
				<div
					key={segment.label}
					className="flex flex-col items-center rounded-lg border bg-card p-3 min-w-[4.5rem]"
				>
					<span className="text-2xl font-bold tabular-nums">
						{String(segment.value).padStart(2, "0")}
					</span>
					<span className="text-xs text-muted-foreground">{segment.label}</span>
				</div>
			))}
		</div>
	);
}
