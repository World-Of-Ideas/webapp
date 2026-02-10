"use client";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface Column {
	key: string;
	label: string;
}

interface DataTableProps {
	columns: Column[];
	data: Record<string, unknown>[];
	onRowClick?: (row: Record<string, unknown>) => void;
}

export function DataTable({ columns, data, onRowClick }: DataTableProps) {
	if (data.length === 0) {
		return (
			<div className="rounded-lg border py-12 text-center">
				<p className="text-sm text-muted-foreground">No data to display.</p>
			</div>
		);
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					{columns.map((col) => (
						<TableHead key={col.key}>{col.label}</TableHead>
					))}
				</TableRow>
			</TableHeader>
			<TableBody>
				{data.map((row, i) => (
					<TableRow
						key={i}
						className={cn(onRowClick && "cursor-pointer")}
						onClick={() => onRowClick?.(row)}
						{...(onRowClick ? {
							tabIndex: 0,
							role: "button",
							onKeyDown: (e: React.KeyboardEvent) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									onRowClick(row);
								}
							},
						} : {})}
					>
						{columns.map((col) => (
							<TableCell key={col.key}>
								{String(row[col.key] ?? "")}
							</TableCell>
						))}
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
