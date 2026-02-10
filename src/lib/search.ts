import { sql } from "drizzle-orm";
import { getDb } from "@/db";
import { escapeLike } from "@/lib/validation";

interface SearchResult {
	type: "page" | "post";
	title: string;
	description: string | null;
	href: string;
}

export async function search(query: string): Promise<{
	pages: SearchResult[];
	posts: SearchResult[];
}> {
	if (query.length < 2) return { pages: [], posts: [] };

	const db = await getDb();
	const pattern = `%${escapeLike(query.trim())}%`;

	const [pageResults, postResults] = await Promise.all([
		db.all(
			sql`SELECT slug, title, description FROM pages
				WHERE published = 1
				AND (title LIKE ${pattern} ESCAPE '\\' OR description LIKE ${pattern} ESCAPE '\\')
				LIMIT 5`,
		),
		db.all(
			sql`SELECT slug, title, description FROM posts
				WHERE published = 1
				AND (title LIKE ${pattern} ESCAPE '\\' OR description LIKE ${pattern} ESCAPE '\\')
				LIMIT 5`,
		),
	]);

	return {
		pages: (pageResults as { slug: string; title: string; description: string | null }[]).map((r) => ({
			type: "page" as const,
			title: r.title,
			description: r.description,
			href: r.slug === "home" ? "/" : `/${r.slug}`,
		})),
		posts: (postResults as { slug: string; title: string; description: string | null }[]).map((r) => ({
			type: "post" as const,
			title: r.title,
			description: r.description,
			href: `/blog/${r.slug}`,
		})),
	};
}
