"use client";

import type { ContentBlock } from "@/types/content";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TableEditorProps {
	block: ContentBlock;
	onChange: (block: ContentBlock) => void;
}

export function TableEditor({ block, onChange }: TableEditorProps) {
	const headers = block.headers ?? [""];
	const rows = block.rows ?? [[""]];

	function updateHeader(index: number, value: string) {
		const updated = [...headers];
		updated[index] = value;
		onChange({ ...block, headers: updated });
	}

	function addHeader() {
		const updatedHeaders = [...headers, ""];
		const updatedRows = rows.map((row) => [...row, ""]);
		onChange({ ...block, headers: updatedHeaders, rows: updatedRows });
	}

	function removeHeader(index: number) {
		if (headers.length <= 1) return;
		const updatedHeaders = headers.filter((_, i) => i !== index);
		const updatedRows = rows.map((row) => row.filter((_, i) => i !== index));
		onChange({ ...block, headers: updatedHeaders, rows: updatedRows });
	}

	function updateCell(rowIndex: number, colIndex: number, value: string) {
		const updatedRows = rows.map((row, ri) => {
			if (ri !== rowIndex) return row;
			const updatedRow = [...row];
			updatedRow[colIndex] = value;
			return updatedRow;
		});
		onChange({ ...block, rows: updatedRows });
	}

	function addRow() {
		const newRow = headers.map(() => "");
		onChange({ ...block, rows: [...rows, newRow] });
	}

	function removeRow(index: number) {
		if (rows.length <= 1) return;
		const updatedRows = rows.filter((_, i) => i !== index);
		onChange({ ...block, rows: updatedRows });
	}

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<Label>Headers</Label>
					<Button type="button" variant="outline" size="xs" onClick={addHeader}>
						Add Column
					</Button>
				</div>
				<div className="flex flex-wrap gap-2">
					{headers.map((header, i) => (
						<div key={i} className="flex items-center gap-1">
							<Input
								value={header}
								onChange={(e) => updateHeader(i, e.target.value)}
								placeholder={`Column ${i + 1}`}
								className="w-32"
							/>
							<Button
								type="button"
								variant="ghost"
								size="icon-xs"
								onClick={() => removeHeader(i)}
								disabled={headers.length <= 1}
							>
								&times;
							</Button>
						</div>
					))}
				</div>
			</div>

			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<Label>Rows</Label>
					<Button type="button" variant="outline" size="xs" onClick={addRow}>
						Add Row
					</Button>
				</div>
				<div className="space-y-2">
					{rows.map((row, ri) => (
						<div key={ri} className="flex items-center gap-2">
							<span className="text-xs text-muted-foreground w-6 text-right">
								{ri + 1}.
							</span>
							<div className="flex flex-wrap gap-1 flex-1">
								{row.map((cell, ci) => (
									<Input
										key={ci}
										value={cell}
										onChange={(e) => updateCell(ri, ci, e.target.value)}
										placeholder={headers[ci] || `Col ${ci + 1}`}
										className="w-32"
									/>
								))}
							</div>
							<Button
								type="button"
								variant="ghost"
								size="icon-xs"
								onClick={() => removeRow(ri)}
								disabled={rows.length <= 1}
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
