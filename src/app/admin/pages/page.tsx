import type { Metadata } from "next";
import Link from "next/link";
import { getAllPages, isSystemPage } from "@/lib/pages";
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
	title: "Pages | Admin",
};

export default async function PagesPage() {
	const allPages = await getAllPages();

	const systemPages = allPages.filter((p) => isSystemPage(p.slug));
	const contentPages = allPages.filter((p) => !isSystemPage(p.slug));

	return (
		<div className="space-y-8">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Pages</h1>
				<Button asChild>
					<Link href="/admin/pages/new">New Page</Link>
				</Button>
			</div>

			{/* System Pages */}
			<section className="space-y-3">
				<h2 className="text-lg font-semibold">System Pages</h2>
				{systemPages.length === 0 ? (
					<p className="text-muted-foreground">
						No system pages found.
					</p>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Title</TableHead>
								<TableHead>Slug</TableHead>
								<TableHead>Description</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{systemPages.map((page) => (
								<TableRow key={page.slug}>
									<TableCell>
										<Link
											href={`/admin/pages/${page.slug}/edit`}
											className="font-medium hover:underline"
										>
											{page.title}
										</Link>
									</TableCell>
									<TableCell className="text-muted-foreground">
										/{page.slug}
									</TableCell>
									<TableCell className="max-w-xs truncate text-muted-foreground">
										{page.description ?? "-"}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</section>

			{/* Content Pages */}
			<section className="space-y-3">
				<h2 className="text-lg font-semibold">Content Pages</h2>
				{contentPages.length === 0 ? (
					<p className="text-muted-foreground">
						No content pages yet. Create a page to get started.
					</p>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Title</TableHead>
								<TableHead>Slug</TableHead>
								<TableHead>Parent</TableHead>
								<TableHead>Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{contentPages.map((page) => (
								<TableRow key={page.slug}>
									<TableCell>
										<Link
											href={`/admin/pages/${page.slug}/edit`}
											className={`font-medium hover:underline ${page.parentSlug ? "ml-6" : ""}`}
										>
											{page.parentSlug ? "└ " : ""}
											{page.title}
										</Link>
									</TableCell>
									<TableCell className="text-muted-foreground">
										/{page.slug}
									</TableCell>
									<TableCell className="text-muted-foreground">
										{page.parentSlug
											? `/${page.parentSlug}`
											: "-"}
									</TableCell>
									<TableCell>
										<Badge
											variant={
												page.published
													? "default"
													: "secondary"
											}
										>
											{page.published
												? "Published"
												: "Draft"}
										</Badge>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</section>
		</div>
	);
}
