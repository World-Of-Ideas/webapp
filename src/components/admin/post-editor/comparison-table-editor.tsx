"use client";

import type { ContentBlock } from "@/types/content";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ComparisonTableEditorProps {
	block: ContentBlock;
	onChange: (block: ContentBlock) => void;
}

export function ComparisonTableEditor({
	block,
	onChange,
}: ComparisonTableEditorProps) {
	const columns = block.comparisonColumns ?? [];
	const rows = block.comparisonRows ?? [];

	function updateColumn(index: number, value: string) {
		const updated = [...columns];
		updated[index] = value;
		onChange({ ...block, comparisonColumns: updated });
	}

	function addColumn() {
		const updatedColumns = [...columns, ""];
		const updatedRows = rows.map((row) => ({
			...row,
			values: [...row.values, ""],
		}));
		onChange({
			...block,
			comparisonColumns: updatedColumns,
			comparisonRows: updatedRows,
		});
	}

	function removeColumn(index: number) {
		if (columns.length <= 1) return;
		const updatedColumns = columns.filter((_, i) => i !== index);
		const updatedRows = rows.map((row) => ({
			...row,
			values: row.values.filter((_, i) => i !== index),
		}));
		const highlight = block.highlightColumn;
		const updatedHighlight =
			highlight === index
				? undefined
				: highlight !== undefined && highlight > index
					? highlight - 1
					: highlight;
		onChange({
			...block,
			comparisonColumns: updatedColumns,
			comparisonRows: updatedRows,
			highlightColumn: updatedHighlight,
		});
	}

	function updateRowFeature(index: number, value: string) {
		const updated = rows.map((row, i) =>
			i === index ? { ...row, feature: value } : row,
		);
		onChange({ ...block, comparisonRows: updated });
	}

	function updateRowValue(
		rowIndex: number,
		colIndex: number,
		value: string,
	) {
		const updated = rows.map((row, ri) => {
			if (ri !== rowIndex) return row;
			const values = [...row.values];
			values[colIndex] = value;
			return { ...row, values };
		});
		onChange({ ...block, comparisonRows: updated });
	}

	function addRow() {
		const newRow = { feature: "", values: columns.map(() => "" as string | boolean) };
		onChange({ ...block, comparisonRows: [...rows, newRow] });
	}

	function removeRow(index: number) {
		onChange({
			...block,
			comparisonRows: rows.filter((_, i) => i !== index),
		});
	}

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<Label>Column Headers</Label>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={addColumn}
					>
						Add Column
					</Button>
				</div>
				<div className="flex flex-wrap gap-2">
					{columns.map((col, i) => (
						<div key={i} className="flex items-center gap-1">
							<Input
								value={col}
								onChange={(e) => updateColumn(i, e.target.value)}
								placeholder={`Column ${i + 1}`}
								className="w-32"
							/>
							<Button
								type="button"
								variant="ghost"
								size="icon-xs"
								onClick={() => removeColumn(i)}
								disabled={columns.length <= 1}
							>
								&times;
							</Button>
						</div>
					))}
				</div>
			</div>

			<div className="space-y-2">
				<Label>Highlight Column</Label>
				<select
					value={block.highlightColumn !== undefined ? String(block.highlightColumn) : ""}
					onChange={(e) =>
						onChange({
							...block,
							highlightColumn: e.target.value
								? Number(e.target.value)
								: undefined,
						})
					}
					className="w-full rounded-md border bg-background px-3 py-2 text-sm"
					aria-label="Highlight column"
				>
					<option value="">None</option>
					{columns.map((col, i) => (
						<option key={i} value={String(i)}>
							{col || `Column ${i + 1}`}
						</option>
					))}
				</select>
			</div>

			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<Label>Rows</Label>
					<Button type="button" variant="outline" size="sm" onClick={addRow}>
						Add Row
					</Button>
				</div>
				<div className="space-y-2">
					{rows.map((row, ri) => (
						<div
							key={ri}
							className="flex items-start gap-2 rounded-md border p-3"
						>
							<div className="flex-1 space-y-2">
								<Input
									value={row.feature}
									onChange={(e) => updateRowFeature(ri, e.target.value)}
									placeholder="Feature name"
								/>
								<div className="flex flex-wrap gap-1">
									{row.values.map((val, ci) => (
										<Input
											key={ci}
											value={String(val)}
											onChange={(e) =>
												updateRowValue(ri, ci, e.target.value)
											}
											placeholder={columns[ci] ? `${columns[ci]}: ✓ or text` : "✓ or text"}
											className="w-32"
										/>
									))}
								</div>
							</div>
							<Button
								type="button"
								variant="ghost"
								size="icon-xs"
								onClick={() => removeRow(ri)}
							>
								&times;
							</Button>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
