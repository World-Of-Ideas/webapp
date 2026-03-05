"use client";

import type { ContentBlock } from "@/types/content";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface StatsCounterEditorProps {
	block: ContentBlock;
	onChange: (block: ContentBlock) => void;
}

export function StatsCounterEditor({
	block,
	onChange,
}: StatsCounterEditorProps) {
	const stats = block.stats ?? [];

	function updateStat(
		index: number,
		field: "value" | "label" | "prefix" | "suffix",
		value: string,
	) {
		const updated = stats.map((stat, i) =>
			i === index ? { ...stat, [field]: value } : stat,
		);
		onChange({ ...block, stats: updated });
	}

	function addStat() {
		onChange({
			...block,
			stats: [...stats, { value: "", label: "", prefix: "", suffix: "" }],
		});
	}

	function removeStat(index: number) {
		onChange({ ...block, stats: stats.filter((_, i) => i !== index) });
	}

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label>Columns</Label>
				<select
					value={String(block.columns ?? 3)}
					onChange={(e) =>
						onChange({
							...block,
							columns: Number(e.target.value) as 2 | 3 | 4 | 5 | 6,
						})
					}
					className="w-full rounded-md border bg-background px-3 py-2 text-sm"
					aria-label="Columns"
				>
					<option value="2">2</option>
					<option value="3">3</option>
					<option value="4">4</option>
					<option value="5">5</option>
					<option value="6">6</option>
				</select>
			</div>

			<div className="flex items-center justify-between">
				<Label>Stats</Label>
				<Button type="button" variant="outline" size="sm" onClick={addStat}>
					Add Stat
				</Button>
			</div>

			<div className="space-y-3">
				{stats.map((stat, i) => (
					<div key={i} className="flex items-start gap-2 rounded-md border p-3">
						<div className="flex-1 space-y-2">
							<div className="grid grid-cols-[1fr_2fr_1fr] gap-2">
								<Input
									value={stat.prefix ?? ""}
									onChange={(e) => updateStat(i, "prefix", e.target.value)}
									placeholder="$"
								/>
								<Input
									value={stat.value}
									onChange={(e) => updateStat(i, "value", e.target.value)}
									placeholder="1,000+"
								/>
								<Input
									value={stat.suffix ?? ""}
									onChange={(e) => updateStat(i, "suffix", e.target.value)}
									placeholder="%"
								/>
							</div>
							<Input
								value={stat.label}
								onChange={(e) => updateStat(i, "label", e.target.value)}
								placeholder="Active Users"
							/>
						</div>
						<Button
							type="button"
							variant="ghost"
							size="icon-xs"
							onClick={() => removeStat(i)}
						>
							&times;
						</Button>
					</div>
				))}
			</div>
		</div>
	);
}
