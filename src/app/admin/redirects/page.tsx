import type { Metadata } from "next";
import Link from "next/link";
import { getAllRedirects } from "@/lib/redirects";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = {
	title: "Redirects | Admin",
};

export default async function RedirectsPage() {
	const redirects = await getAllRedirects();

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Redirects</h1>
				<Button asChild>
					<Link href="/admin/redirects/new">New Redirect</Link>
				</Button>
			</div>

			{redirects.length === 0 ? (
				<p className="text-muted-foreground">
					No redirects yet. Create your first redirect to get started.
				</p>
			) : (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>From Path</TableHead>
							<TableHead>To URL</TableHead>
							<TableHead>Status Code</TableHead>
							<TableHead>Enabled</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{redirects.map((redirect) => (
							<TableRow key={redirect.id}>
								<TableCell className="font-mono text-sm">
									{redirect.fromPath}
								</TableCell>
								<TableCell className="max-w-xs truncate text-muted-foreground">
									{redirect.toUrl}
								</TableCell>
								<TableCell>
									<Badge variant="outline">
										{redirect.statusCode}
									</Badge>
								</TableCell>
								<TableCell>
									<Badge
										variant={
											redirect.enabled
												? "default"
												: "secondary"
										}
									>
										{redirect.enabled
											? "Active"
											: "Disabled"}
									</Badge>
								</TableCell>
								<TableCell>
									<Button asChild variant="ghost" size="sm">
										<Link href={`/admin/redirects/${redirect.id}/edit`}>
											Edit
										</Link>
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
		</div>
	);
}
