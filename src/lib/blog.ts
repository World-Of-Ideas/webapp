import { eq, desc, sql, count, and, or, isNull, lte } from "drizzle-orm";
import { getDb } from "@/db";
import { posts } from "@/db/schema";

/** Published AND (no schedule OR schedule has passed) */
const isLive = and(
	eq(posts.published, true),
	or(isNull(posts.scheduledPublishAt), lte(posts.scheduledPublishAt, sql`datetime('now')`)),
);

export async function getPublishedPosts(page: number, limit: number) {
	const db = await getDb();
	const offset = (page - 1) * limit;

	const [items, [{ total }]] = await Promise.all([
		db.query.posts.findMany({
			where: isLive,
			orderBy: [desc(posts.publishedAt), desc(posts.createdAt), desc(posts.id)],
			limit,
			offset,
		}),
		db
			.select({ total: count() })
			.from(posts)
			.where(isLive),
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
		where: and(
			eq(posts.slug, slug),
			eq(posts.published, true),
			or(isNull(posts.scheduledPublishAt), lte(posts.scheduledPublishAt, sql`datetime('now')`)),
		),
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
		sql`SELECT DISTINCT p.slug, p.title, p.description, p.cover_image, p.published_at, p.tags FROM posts p, json_each(p.tags) AS t
			WHERE p.published = 1
			AND (p.scheduled_publish_at IS NULL OR p.scheduled_publish_at <= datetime('now'))
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
		where: isLive,
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
	scheduledPublishAt?: string | null;
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
			scheduledPublishAt: data.scheduledPublishAt ?? null,
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
		scheduledPublishAt: string | null;
	}>,
) {
	const db = await getDb();
	const now = new Date().toISOString();

	// Allowlist fields to prevent mass assignment (no id, createdAt, publishedAt overwrite)
	const updateData: Record<string, unknown> = { updatedAt: now };
	if (data.slug !== undefined) updateData.slug = data.slug;
	if (data.title !== undefined) updateData.title = data.title;
	if (data.description !== undefined) updateData.description = data.description;
	if (data.content !== undefined) updateData.content = data.content;
	if (data.faqs !== undefined) updateData.faqs = data.faqs;
	if (data.coverImage !== undefined) updateData.coverImage = data.coverImage;
	if (data.author !== undefined) updateData.author = data.author;
	if (data.tags !== undefined) updateData.tags = data.tags;
	if (data.published !== undefined) updateData.published = data.published;
	if (data.scheduledPublishAt !== undefined) updateData.scheduledPublishAt = data.scheduledPublishAt;

	// Set publishedAt atomically using SQL CASE to avoid TOCTOU
	if (data.published === true) {
		updateData.publishedAt = sql`CASE WHEN ${posts.publishedAt} IS NULL THEN ${now} ELSE ${posts.publishedAt} END`;
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
	// Get the post slug before deletion for R2 cleanup reference
	const post = await db.query.posts.findFirst({ where: eq(posts.id, id) });
	await db.delete(posts).where(eq(posts.id, id));
	return post?.slug ?? null;
}

export async function getPostCount() {
	const db = await getDb();
	const [{ total }] = await db
		.select({ total: count() })
		.from(posts)
		.where(isLive);
	return total;
}
