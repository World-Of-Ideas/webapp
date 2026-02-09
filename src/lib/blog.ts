import { eq, desc, sql, count, and, ne } from "drizzle-orm";
import { getDb } from "@/db";
import { posts } from "@/db/schema";

export async function getPublishedPosts(page: number, limit: number) {
	const db = await getDb();
	const offset = (page - 1) * limit;

	const [items, [{ total }]] = await Promise.all([
		db.query.posts.findMany({
			where: eq(posts.published, true),
			orderBy: [desc(posts.publishedAt)],
			limit,
			offset,
		}),
		db
			.select({ total: count() })
			.from(posts)
			.where(eq(posts.published, true)),
	]);

	return { items, total };
}

export async function getPostBySlug(slug: string) {
	const db = await getDb();
	return db.query.posts.findFirst({
		where: eq(posts.slug, slug),
	});
}

export async function getPublishedPostBySlug(slug: string) {
	const db = await getDb();
	return db.query.posts.findFirst({
		where: and(eq(posts.slug, slug), eq(posts.published, true)),
	});
}

export interface RelatedPost {
	slug: string;
	title: string;
	description: string;
	cover_image: string | null;
	published_at: string | null;
	tags: string | null;
}

export async function getRelatedPosts(currentSlug: string, tags: string[], limit = 3): Promise<RelatedPost[]> {
	if (!tags || tags.length === 0) return [];

	const db = await getDb();

	// Use json_each to find posts sharing at least one tag
	// Note: db.all() returns raw SQL rows with snake_case column names
	const results = await db.all(
		sql`SELECT DISTINCT p.* FROM posts p, json_each(p.tags) AS t
			WHERE p.published = 1
			AND p.slug != ${currentSlug}
			AND t.value IN (${sql.join(
				tags.map((tag) => sql`${tag}`),
				sql`, `,
			)})
			ORDER BY p.published_at DESC
			LIMIT ${limit}`,
	);

	return results as RelatedPost[];
}

export async function getRecentPosts(limit = 3) {
	const db = await getDb();
	return db.query.posts.findMany({
		where: eq(posts.published, true),
		orderBy: [desc(posts.publishedAt)],
		limit,
	});
}

export async function getAllPosts() {
	const db = await getDb();
	return db.query.posts.findMany({
		orderBy: [desc(posts.createdAt)],
	});
}

export async function createPost(data: {
	slug: string;
	title: string;
	description: string;
	content: unknown;
	faqs?: unknown;
	coverImage?: string;
	author?: string;
	tags?: unknown;
	published?: boolean;
}) {
	const db = await getDb();
	const now = new Date().toISOString();
	const [post] = await db
		.insert(posts)
		.values({
			slug: data.slug,
			title: data.title,
			description: data.description,
			content: data.content as typeof posts.$inferInsert.content,
			faqs: (data.faqs as typeof posts.$inferInsert.faqs) ?? null,
			coverImage: data.coverImage ?? null,
			author: data.author ?? "Admin",
			tags: (data.tags as typeof posts.$inferInsert.tags) ?? null,
			published: data.published ?? false,
			publishedAt: data.published ? now : null,
			createdAt: now,
			updatedAt: now,
		})
		.returning();
	return post;
}

export async function updatePost(
	id: number,
	data: Partial<{
		slug: string;
		title: string;
		description: string;
		content: unknown;
		faqs: unknown;
		coverImage: string | null;
		author: string;
		tags: unknown;
		published: boolean;
	}>,
) {
	const db = await getDb();
	const now = new Date().toISOString();

	// If publishing for the first time, set publishedAt
	const updateData: Record<string, unknown> = {
		...data,
		updatedAt: now,
	};

	if (data.published !== undefined) {
		// Get current post to check if publishedAt needs to be set
		const existing = await db.query.posts.findFirst({
			where: eq(posts.id, id),
		});
		if (data.published && !existing?.publishedAt) {
			updateData.publishedAt = now;
		}
	}

	const [post] = await db
		.update(posts)
		.set(updateData as typeof posts.$inferInsert)
		.where(eq(posts.id, id))
		.returning();
	return post;
}

export async function deletePost(id: number) {
	const db = await getDb();
	await db.delete(posts).where(eq(posts.id, id));
}

export async function getPostCount() {
	const db = await getDb();
	const [{ total }] = await db
		.select({ total: count() })
		.from(posts)
		.where(eq(posts.published, true));
	return total;
}
