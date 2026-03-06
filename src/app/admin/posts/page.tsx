import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { getSiteSettings } from "@/lib/site-settings";
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
	title: "Posts | Admin",
};

export default async function PostsPage() {
	const settings = await getSiteSettings();
	if (!settings.features.blog) notFound();

	const posts = await getAllPosts();

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Posts</h1>
				<Button asChild>
					<Link href="/admin/posts/new">New Post</Link>
				</Button>
			</div>

			{posts.length === 0 ? (
				<p className="text-muted-foreground">
					No posts yet. Create your first post to get started.
				</p>
			) : (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Title</TableHead>
							<TableHead>Slug</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Date</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{posts.map((post) => (
							<TableRow key={post.id}>
								<TableCell>
									<Link
										href={`/admin/posts/${post.id}/edit`}
										className="font-medium hover:underline"
									>
										{post.title}
									</Link>
								</TableCell>
								<TableCell className="text-muted-foreground">
									{post.slug}
								</TableCell>
								<TableCell>
									<div className="flex gap-1">
										<Badge
											variant={
												post.published
													? "default"
													: "secondary"
											}
										>
											{post.published
												? "Published"
												: "Draft"}
										</Badge>
										{post.scheduledPublishAt && new Date(post.scheduledPublishAt + "Z") > new Date() && (
											<Badge variant="outline">
												Scheduled
											</Badge>
										)}
									</div>
								</TableCell>
								<TableCell className="text-muted-foreground">
									{post.publishedAt
										? new Date(
												post.publishedAt,
											).toLocaleDateString()
										: new Date(
												post.createdAt,
											).toLocaleDateString()}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
		</div>
	);
}
