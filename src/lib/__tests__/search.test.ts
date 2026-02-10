import { describe, it, expect, beforeEach } from "vitest";
import { cleanTables } from "../../../test/helpers";
import { getDb } from "@/db";
import { posts, pages } from "@/db/schema";
import { search } from "../search";

describe("search (integration)", () => {
	beforeEach(async () => {
		await cleanTables("posts", "pages");
	});

	it("returns matching pages and posts", async () => {
		const db = await getDb();
		await db.insert(pages).values({
			slug: "about-us",
			title: "About Us",
			description: "Learn more about our company",
			published: true,
		});
		await db.insert(pages).values({
			slug: "pricing",
			title: "Pricing Plans",
			description: "View our pricing tiers",
			published: true,
		});
		await db.insert(posts).values({
			slug: "welcome-post",
			title: "Welcome to Our Blog",
			description: "An introduction about us",
			content: [],
			published: true,
		});

		const result = await search("about");

		expect(result.pages).toHaveLength(1);
		expect(result.pages[0].title).toBe("About Us");
		expect(result.pages[0].href).toBe("/about-us");
		expect(result.pages[0].type).toBe("page");

		expect(result.posts).toHaveLength(1);
		expect(result.posts[0].title).toBe("Welcome to Our Blog");
		expect(result.posts[0].description).toBe("An introduction about us");
		expect(result.posts[0].href).toBe("/blog/welcome-post");
		expect(result.posts[0].type).toBe("post");
	});

	it("matches against title", async () => {
		const db = await getDb();
		await db.insert(pages).values({
			slug: "features",
			title: "Amazing Features",
			description: "A list of features",
			published: true,
		});

		const result = await search("Amazing");
		expect(result.pages).toHaveLength(1);
		expect(result.pages[0].title).toBe("Amazing Features");
	});

	it("matches against description", async () => {
		const db = await getDb();
		await db.insert(posts).values({
			slug: "guide",
			title: "Getting Started",
			description: "A comprehensive tutorial for beginners",
			content: [],
			published: true,
		});

		const result = await search("tutorial");
		expect(result.posts).toHaveLength(1);
		expect(result.posts[0].title).toBe("Getting Started");
	});

	it("returns empty arrays for queries shorter than 2 characters", async () => {
		const db = await getDb();
		await db.insert(pages).values({
			slug: "a-page",
			title: "A Page",
			description: "Some content",
			published: true,
		});

		const result = await search("A");
		expect(result.pages).toHaveLength(0);
		expect(result.posts).toHaveLength(0);
	});

	it("returns empty arrays for empty query", async () => {
		const result = await search("");
		expect(result.pages).toHaveLength(0);
		expect(result.posts).toHaveLength(0);
	});

	it("returns empty arrays when no matches are found", async () => {
		const db = await getDb();
		await db.insert(pages).values({
			slug: "hello",
			title: "Hello World",
			description: "Greeting page",
			published: true,
		});

		const result = await search("nonexistent");
		expect(result.pages).toHaveLength(0);
		expect(result.posts).toHaveLength(0);
	});

	it("does not return unpublished pages or posts", async () => {
		const db = await getDb();
		await db.insert(pages).values({
			slug: "draft-page",
			title: "Draft Feature Page",
			description: "Not ready yet",
			published: false,
		});
		await db.insert(posts).values({
			slug: "draft-post",
			title: "Draft Feature Post",
			description: "Not ready yet",
			content: [],
			published: false,
		});

		const result = await search("Feature");
		expect(result.pages).toHaveLength(0);
		expect(result.posts).toHaveLength(0);
	});

	it("escapes LIKE wildcard % so it does not match everything", async () => {
		const db = await getDb();
		await db.insert(pages).values({
			slug: "normal-page",
			title: "Normal Page",
			description: "Regular content",
			published: true,
		});
		await db.insert(pages).values({
			slug: "percent-page",
			title: "100% Off Sale",
			description: "Discount page",
			published: true,
		});

		// Searching for just "%" should not return all pages — the % is escaped
		const result = await search("%%");
		expect(result.pages).toHaveLength(0);
	});

	it("escapes LIKE wildcard _ so it does not act as single-char wildcard", async () => {
		const db = await getDb();
		await db.insert(posts).values({
			slug: "underscored",
			title: "Use snake_case naming",
			description: "Coding conventions",
			content: [],
			published: true,
		});
		await db.insert(posts).values({
			slug: "other",
			title: "Use snakeXcase naming",
			description: "Other post",
			content: [],
			published: true,
		});

		// Without escaping, "_" would match any single char and both posts would match.
		// With escaping, "_" is treated as literal backslash+underscore in the LIKE pattern,
		// so neither row matches (the data doesn't contain "\\_").
		// The key assertion: "snakeXcase" must NOT match a "_" wildcard pattern.
		const result = await search("snake_case");
		// snakeXcase should not appear in results — the _ is not acting as a wildcard
		const titles = result.posts.map((p) => p.title);
		expect(titles).not.toContain("Use snakeXcase naming");
	});

	it("limits results to 5 per type", async () => {
		const db = await getDb();
		for (let i = 0; i < 7; i++) {
			await db.insert(pages).values({
				slug: `page-${i}`,
				title: `Test Page ${i}`,
				description: "Searchable content",
				published: true,
			});
		}

		const result = await search("Test Page");
		expect(result.pages).toHaveLength(5);
	});

	it("maps home slug to / for pages", async () => {
		const db = await getDb();
		await db.insert(pages).values({
			slug: "home",
			title: "Home Page",
			description: "Welcome home",
			published: true,
		});

		const result = await search("Home");
		expect(result.pages).toHaveLength(1);
		expect(result.pages[0].href).toBe("/");
	});

	it("trims whitespace from query before searching", async () => {
		const db = await getDb();
		await db.insert(posts).values({
			slug: "trimtest",
			title: "Trim Test Article",
			description: "Testing trim",
			content: [],
			published: true,
		});

		const result = await search("  Trim Test  ");
		expect(result.posts).toHaveLength(1);
		expect(result.posts[0].title).toBe("Trim Test Article");
	});

	it("performs case-insensitive matching (SQLite LIKE default)", async () => {
		const db = await getDb();
		await db.insert(pages).values({
			slug: "case-test",
			title: "CamelCase Title",
			description: "Mixed case test",
			published: true,
		});

		const result = await search("camelcase");
		expect(result.pages).toHaveLength(1);
		expect(result.pages[0].title).toBe("CamelCase Title");
	});
});
