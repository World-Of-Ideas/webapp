import { describe, it, expect, beforeEach } from "vitest";
import { cleanTables } from "../../../test/helpers";
import {
	isReservedSlug,
	isSystemPage,
	getPageBySlug,
	getPublishedPageBySlug,
	getChildPages,
	getAllPages,
	getPublishedContentPages,
	createPage,
	updatePage,
	deletePage,
} from "../pages";

describe("pages (integration)", () => {
	beforeEach(async () => {
		await cleanTables("pages");
	});

	describe("isReservedSlug / isSystemPage", () => {
		it("recognizes system slugs", () => {
			expect(isSystemPage("home")).toBe(true);
			expect(isSystemPage("waitlist")).toBe(true);
			expect(isSystemPage("custom")).toBe(false);
		});

		it("recognizes reserved slugs (system + admin/api)", () => {
			expect(isReservedSlug("admin")).toBe(true);
			expect(isReservedSlug("api")).toBe(true);
			expect(isReservedSlug("home")).toBe(true);
			expect(isReservedSlug("my-page")).toBe(false);
		});
	});

	describe("createPage / getPageBySlug", () => {
		it("creates and retrieves a page", async () => {
			const page = await createPage({
				slug: "about",
				title: "About Us",
				description: "Learn about us",
			});

			expect(page.slug).toBe("about");
			expect(page.published).toBe(true);

			const found = await getPageBySlug("about");
			expect(found?.title).toBe("About Us");
		});

		it("stores content, FAQs, and metadata", async () => {
			const page = await createPage({
				slug: "faq-page",
				title: "FAQ",
				content: [{ type: "paragraph", text: "Hello" }],
				faqs: [{ question: "Q?", answer: "A." }],
				metadata: { custom: true },
			});

			const found = await getPageBySlug("faq-page");
			expect(found?.content).toEqual([{ type: "paragraph", text: "Hello" }]);
			expect(found?.faqs).toEqual([{ question: "Q?", answer: "A." }]);
			expect(found?.metadata).toEqual({ custom: true });
		});
	});

	describe("getPublishedPageBySlug", () => {
		it("returns null for unpublished page", async () => {
			await createPage({ slug: "draft", title: "Draft", published: false });
			const found = await getPublishedPageBySlug("draft");
			expect(found).toBeUndefined();
		});
	});

	describe("getChildPages", () => {
		it("returns children sorted by sortOrder", async () => {
			await createPage({ slug: "parent", title: "Parent" });
			await createPage({ slug: "child-b", title: "Child B", parentSlug: "parent", sortOrder: 2 });
			await createPage({ slug: "child-a", title: "Child A", parentSlug: "parent", sortOrder: 1 });

			const children = await getChildPages("parent");
			expect(children).toHaveLength(2);
			expect(children[0].slug).toBe("child-a");
			expect(children[1].slug).toBe("child-b");
		});

		it("excludes unpublished children", async () => {
			await createPage({ slug: "parent", title: "Parent" });
			await createPage({ slug: "hidden", title: "Hidden", parentSlug: "parent", published: false });

			const children = await getChildPages("parent");
			expect(children).toHaveLength(0);
		});
	});

	describe("updatePage", () => {
		it("updates page fields", async () => {
			await createPage({ slug: "test", title: "Original" });
			const updated = await updatePage("test", { title: "Updated" });
			expect(updated.title).toBe("Updated");
		});
	});

	describe("deletePage", () => {
		it("deletes a content page", async () => {
			await createPage({ slug: "temp", title: "Temp" });
			await deletePage("temp");
			const found = await getPageBySlug("temp");
			expect(found).toBeUndefined();
		});

		it("throws when deleting a system page", async () => {
			await createPage({ slug: "home", title: "Home" });
			await expect(deletePage("home")).rejects.toThrow("Cannot delete system pages");
		});
	});

	describe("getAllPages / getPublishedContentPages", () => {
		it("getAllPages includes unpublished", async () => {
			await createPage({ slug: "a", title: "A" });
			await createPage({ slug: "b", title: "B", published: false });

			const all = await getAllPages();
			expect(all).toHaveLength(2);
		});

		it("getPublishedContentPages excludes unpublished", async () => {
			await createPage({ slug: "a", title: "A" });
			await createPage({ slug: "b", title: "B", published: false });

			const published = await getPublishedContentPages();
			expect(published).toHaveLength(1);
		});
	});
});
