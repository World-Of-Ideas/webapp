import { eq, and, count } from "drizzle-orm";
import { getDb } from "@/db";
import { pages } from "@/db/schema";

const SYSTEM_SLUGS = new Set(["home", "waitlist", "giveaway", "contact", "blog", "terms", "privacy"]);
const RESERVED_SLUGS = new Set([...SYSTEM_SLUGS, "admin", "api", "feed.xml"]);

export function isReservedSlug(slug: string): boolean {
	return RESERVED_SLUGS.has(slug);
}

export function isSystemPage(slug: string): boolean {
	return SYSTEM_SLUGS.has(slug);
}

export async function getPageBySlug(slug: string) {
	const db = await getDb();
	return db.query.pages.findFirst({
		where: eq(pages.slug, slug),
	});
}

export async function getPublishedPageBySlug(slug: string) {
	const db = await getDb();
	return db.query.pages.findFirst({
		where: and(eq(pages.slug, slug), eq(pages.published, true)),
	});
}

export async function getChildPages(parentSlug: string) {
	const db = await getDb();
	return db.query.pages.findMany({
		where: and(eq(pages.parentSlug, parentSlug), eq(pages.published, true)),
		orderBy: (p, { asc }) => [asc(p.sortOrder)],
	});
}

export async function getAllPages() {
	const db = await getDb();
	return db.query.pages.findMany({
		orderBy: (p, { asc }) => [asc(p.sortOrder)],
	});
}

export async function getPublishedContentPages() {
	const db = await getDb();
	return db.query.pages.findMany({
		where: eq(pages.published, true),
		orderBy: (p, { asc }) => [asc(p.sortOrder)],
	});
}

export async function createPage(data: {
	slug: string;
	parentSlug?: string;
	title: string;
	description?: string;
	content?: unknown;
	faqs?: unknown;
	relatedPages?: unknown;
	coverImage?: string;
	metadata?: unknown;
	published?: boolean;
	sortOrder?: number;
}) {
	const db = await getDb();
	const [page] = await db
		.insert(pages)
		.values({
			slug: data.slug,
			parentSlug: data.parentSlug ?? null,
			title: data.title,
			description: data.description ?? null,
			content: data.content as typeof pages.$inferInsert.content,
			faqs: (data.faqs as typeof pages.$inferInsert.faqs) ?? null,
			relatedPages: (data.relatedPages as typeof pages.$inferInsert.relatedPages) ?? null,
			coverImage: data.coverImage ?? null,
			metadata: (data.metadata as typeof pages.$inferInsert.metadata) ?? null,
			published: data.published ?? true,
			sortOrder: data.sortOrder ?? 0,
		})
		.returning();
	return page;
}

export async function updatePage(
	slug: string,
	data: Partial<{
		parentSlug: string | null;
		title: string;
		description: string | null;
		content: unknown;
		faqs: unknown;
		relatedPages: unknown;
		coverImage: string | null;
		metadata: unknown;
		published: boolean;
		sortOrder: number;
	}>,
) {
	const db = await getDb();
	const now = new Date().toISOString();
	const [page] = await db
		.update(pages)
		.set({ ...data, updatedAt: now } as typeof pages.$inferInsert)
		.where(eq(pages.slug, slug))
		.returning();
	return page;
}

export async function deletePage(slug: string) {
	if (isSystemPage(slug)) {
		throw new Error("Cannot delete system pages");
	}
	const db = await getDb();
	await db.delete(pages).where(eq(pages.slug, slug));
}
