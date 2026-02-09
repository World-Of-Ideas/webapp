import { getRelatedPosts } from "@/lib/blog";
import { PostCard } from "./post-card";

interface RelatedPostsProps {
	currentSlug: string;
	tags: string[];
}

export async function RelatedPosts({ currentSlug, tags }: RelatedPostsProps) {
	const relatedPosts = await getRelatedPosts(currentSlug, tags);

	if (!relatedPosts || relatedPosts.length === 0) {
		return null;
	}

	return (
		<section className="space-y-6">
			<h2 className="text-2xl font-bold">Related Posts</h2>
			<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{relatedPosts.map((post) => (
					<PostCard
						key={post.slug}
						post={{
							slug: post.slug,
							title: post.title,
							description: post.description,
							coverImage: post.cover_image,
							publishedAt: post.published_at,
							tags: post.tags ? JSON.parse(post.tags) : null,
						}}
					/>
				))}
			</div>
		</section>
	);
}
