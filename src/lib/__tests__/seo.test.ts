import { describe, it, expect, beforeEach } from "vitest";
import { cleanTables } from "../../../test/helpers";
import { getSeoAudit } from "@/lib/seo";
import { getDb } from "@/db";
import { posts, pages } from "@/db/schema";

describe("seo", () => {
	beforeEach(async () => {
		await cleanTables("posts", "pages");
	});

	describe("getSeoAudit", () => {
		it("returns empty array when no published content", async () => {
			const audit = await getSeoAudit();
			expect(audit).toEqual([]);
		});

		it("excludes unpublished pages", async () => {
			const db = await getDb();
			await db.insert(pages).values({
				slug: "draft-page",
				title: "Draft Page",
				published: false,
			});

			const audit = await getSeoAudit();
			expect(audit).toHaveLength(0);
		});

		it("excludes unpublished posts", async () => {
			const db = await getDb();
			await db.insert(posts).values({
				slug: "draft-post",
				title: "Draft Post",
				description: "A draft post",
				content: [],
				published: false,
			});

			const audit = await getSeoAudit();
			expect(audit).toHaveLength(0);
		});

		it("audits a published page with all fields", async () => {
			const db = await getDb();
			// Pass actual objects (not JSON.stringify) — Drizzle's mode: "json" handles serialization
			await db.insert(pages).values({
				slug: "about",
				title: "About Us",
				description: "Learn about our company",
				published: true,
				coverImage: "https://example.com/cover.webp",
				faqs: [
					{ question: "Q1?", answer: "A1" },
					{ question: "Q2?", answer: "A2" },
				],
				relatedPages: [
					{ title: "Contact", description: "Contact us", href: "/contact" },
				],
			});

			const audit = await getSeoAudit();
			expect(audit).toHaveLength(1);

			const item = audit[0];
			expect(item.type).toBe("page");
			expect(item.slug).toBe("about");
			expect(item.title).toBe("About Us");
			expect(item.titleLength).toBe("About Us".length);
			expect(item.descriptionLength).toBe("Learn about our company".length);
			expect(item.hasFaqs).toBe(true);
			expect(item.faqCount).toBe(2);
			expect(item.hasRelatedPages).toBe(true);
			expect(item.hasCoverImage).toBe(true);
			// Pages don't have tags
			expect(item.hasTags).toBe(false);
			expect(item.tagCount).toBe(0);
		});

		it("audits a published page with missing fields", async () => {
			const db = await getDb();
			await db.insert(pages).values({
				slug: "minimal",
				title: "Minimal Page",
				published: true,
				// No description, no faqs, no relatedPages, no coverImage
			});

			const audit = await getSeoAudit();
			expect(audit).toHaveLength(1);

			const item = audit[0];
			expect(item.descriptionLength).toBe(0);
			expect(item.hasFaqs).toBe(false);
			expect(item.faqCount).toBe(0);
			expect(item.hasRelatedPages).toBe(false);
			expect(item.hasCoverImage).toBe(false);
		});

		it("audits a published post with all fields", async () => {
			const db = await getDb();
			await db.insert(posts).values({
				slug: "my-post",
				title: "My Blog Post Title",
				description: "A great blog post about testing",
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			content: [{ type: "paragraph", text: "Hello" }] as any,
				published: true,
				coverImage: "https://example.com/blog/my-post/cover.webp",
				faqs: [{ question: "What?", answer: "This." }],
				tags: ["testing", "vitest", "typescript"],
			});

			const audit = await getSeoAudit();
			expect(audit).toHaveLength(1);

			const item = audit[0];
			expect(item.type).toBe("post");
			expect(item.slug).toBe("my-post");
			expect(item.title).toBe("My Blog Post Title");
			expect(item.titleLength).toBe("My Blog Post Title".length);
			expect(item.descriptionLength).toBe("A great blog post about testing".length);
			expect(item.hasFaqs).toBe(true);
			expect(item.faqCount).toBe(1);
			// Posts don't use manual related pages
			expect(item.hasRelatedPages).toBe(false);
			expect(item.hasCoverImage).toBe(true);
			expect(item.hasTags).toBe(true);
			expect(item.tagCount).toBe(3);
		});

		it("audits a published post with no optional fields", async () => {
			const db = await getDb();
			await db.insert(posts).values({
				slug: "bare-post",
				title: "Bare Post",
				description: "No extras",
				content: [],
				published: true,
			});

			const audit = await getSeoAudit();
			expect(audit).toHaveLength(1);

			const item = audit[0];
			expect(item.hasFaqs).toBe(false);
			expect(item.faqCount).toBe(0);
			expect(item.hasCoverImage).toBe(false);
			expect(item.hasTags).toBe(false);
			expect(item.tagCount).toBe(0);
		});

		it("includes both pages and posts in the audit", async () => {
			const db = await getDb();
			await db.insert(pages).values({
				slug: "about",
				title: "About",
				published: true,
			});
			await db.insert(posts).values({
				slug: "blog-post",
				title: "Blog Post",
				description: "A post",
				content: [],
				published: true,
			});

			const audit = await getSeoAudit();
			expect(audit).toHaveLength(2);

			const types = audit.map((a) => a.type);
			expect(types).toContain("page");
			expect(types).toContain("post");
		});

		it("handles empty FAQs array (not null)", async () => {
			const db = await getDb();
			await db.insert(pages).values({
				slug: "empty-faqs",
				title: "Empty FAQs Page",
				published: true,
				faqs: [],
			});

			const audit = await getSeoAudit();
			expect(audit).toHaveLength(1);

			const item = audit[0];
			expect(item.hasFaqs).toBe(false);
			expect(item.faqCount).toBe(0);
		});

		it("handles empty tags array", async () => {
			const db = await getDb();
			await db.insert(posts).values({
				slug: "empty-tags",
				title: "No Tags",
				description: "Post with empty tags",
				content: [],
				published: true,
				tags: [],
			});

			const audit = await getSeoAudit();
			const item = audit[0];
			expect(item.hasTags).toBe(false);
			expect(item.tagCount).toBe(0);
		});
	});
});
