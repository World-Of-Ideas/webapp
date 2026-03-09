import { describe, it, expect, beforeEach } from "vitest";
import { cleanTables } from "../../../test/helpers";
import {
	getPublishedPosts,
	getPostBySlug,
	getPublishedPostBySlug,
	getRelatedPosts,
	getRecentPosts,
	getAllPosts,
	createPost,
	updatePost,
	deletePost,
	getPostCount,
} from "../blog";

describe("blog (integration)", () => {
	beforeEach(async () => {
		await cleanTables("posts");
	});

	describe("createPost / getPostBySlug", () => {
		it("creates a post and retrieves it by slug", async () => {
			const post = await createPost({
				slug: "hello-world",
				title: "Hello World",
				description: "First post",
				content: [{ type: "paragraph", text: "Hello!" }],
				tags: ["intro"],
			});

			expect(post.slug).toBe("hello-world");
			expect(post.published).toBe(false);

			const found = await getPostBySlug("hello-world");
			expect(found?.title).toBe("Hello World");
		});

		it("sets publishedAt when published: true", async () => {
			const post = await createPost({
				slug: "launched",
				title: "Launched",
				description: "We launched",
				content: [],
				published: true,
			});

			expect(post.published).toBe(true);
			expect(post.publishedAt).toBeTruthy();
		});

		it("stores scheduledPublishAt", async () => {
			await createPost({
				slug: "scheduled-post",
				title: "Scheduled",
				description: "Will publish later",
				content: [],
				scheduledPublishAt: "2099-01-01T00:00:00Z",
			});

			const found = await getPostBySlug("scheduled-post");
			expect(found?.scheduledPublishAt).toBe("2099-01-01T00:00:00Z");
		});
	});

	describe("getPublishedPosts", () => {
		it("returns only published posts", async () => {
			await createPost({ slug: "draft", title: "Draft", description: "d", content: [] });
			await createPost({ slug: "live", title: "Live", description: "l", content: [], published: true });

			const { items, total } = await getPublishedPosts(1, 10);
			expect(total).toBe(1);
			expect(items[0].slug).toBe("live");
		});

		it("excludes posts scheduled in the future", async () => {
			await createPost({
				slug: "future-post",
				title: "Future",
				description: "d",
				content: [],
				published: true,
				scheduledPublishAt: "2099-01-01T00:00:00Z",
			});

			const { items, total } = await getPublishedPosts(1, 10);
			expect(total).toBe(0);
			expect(items).toHaveLength(0);
		});

		it("includes posts with past scheduledPublishAt", async () => {
			await createPost({
				slug: "past-scheduled",
				title: "Past Scheduled",
				description: "d",
				content: [],
				published: true,
				scheduledPublishAt: "2020-01-01T00:00:00Z",
			});

			const { items, total } = await getPublishedPosts(1, 10);
			expect(total).toBe(1);
			expect(items[0].slug).toBe("past-scheduled");
		});

		it("includes published posts without scheduledPublishAt", async () => {
			await createPost({
				slug: "no-schedule",
				title: "No Schedule",
				description: "d",
				content: [],
				published: true,
				scheduledPublishAt: undefined,
			});

			const { items, total } = await getPublishedPosts(1, 10);
			expect(total).toBe(1);
			expect(items[0].slug).toBe("no-schedule");
		});
	});

	describe("getPublishedPostBySlug", () => {
		it("returns null for unpublished post", async () => {
			await createPost({ slug: "draft", title: "Draft", description: "d", content: [] });
			const found = await getPublishedPostBySlug("draft");
			expect(found).toBeUndefined();
		});

		it("returns published post", async () => {
			await createPost({ slug: "live", title: "Live", description: "l", content: [], published: true });
			const found = await getPublishedPostBySlug("live");
			expect(found?.slug).toBe("live");
		});

		it("returns undefined for future-scheduled post", async () => {
			await createPost({
				slug: "future-slug",
				title: "Future",
				description: "d",
				content: [],
				published: true,
				scheduledPublishAt: "2099-01-01T00:00:00Z",
			});

			const found = await getPublishedPostBySlug("future-slug");
			expect(found).toBeUndefined();
		});
	});

	describe("updatePost", () => {
		it("updates post fields", async () => {
			const post = await createPost({ slug: "original", title: "Original", description: "d", content: [] });
			const updated = await updatePost(post.id, { title: "Updated Title" });
			expect(updated.title).toBe("Updated Title");
		});

		it("sets publishedAt on first publish", async () => {
			const post = await createPost({ slug: "will-publish", title: "WP", description: "d", content: [] });
			expect(post.publishedAt).toBeNull();

			const updated = await updatePost(post.id, { published: true });
			expect(updated.publishedAt).toBeTruthy();
		});

		it("can set scheduledPublishAt", async () => {
			const post = await createPost({ slug: "schedule-me", title: "S", description: "d", content: [] });
			const updated = await updatePost(post.id, { scheduledPublishAt: "2099-01-01T00:00:00Z" });
			expect(updated.scheduledPublishAt).toBe("2099-01-01T00:00:00Z");
		});
	});

	describe("deletePost", () => {
		it("removes the post and returns its slug", async () => {
			const post = await createPost({ slug: "to-delete", title: "Delete Me", description: "d", content: [] });
			const slug = await deletePost(post.id);
			expect(slug).toBe("to-delete");
			const found = await getPostBySlug("to-delete");
			expect(found).toBeUndefined();
		});

		it("returns null for non-existent post", async () => {
			expect(await deletePost(99999)).toBeNull();
		});
	});

	describe("getPostCount", () => {
		it("counts only published posts", async () => {
			await createPost({ slug: "draft", title: "Draft", description: "d", content: [] });
			await createPost({ slug: "live1", title: "Live 1", description: "l", content: [], published: true });
			await createPost({ slug: "live2", title: "Live 2", description: "l", content: [], published: true });

			const count = await getPostCount();
			expect(count).toBe(2);
		});

		it("excludes future-scheduled posts from count", async () => {
			await createPost({
				slug: "future-count",
				title: "Future",
				description: "d",
				content: [],
				published: true,
				scheduledPublishAt: "2099-01-01T00:00:00Z",
			});
			await createPost({ slug: "live-count", title: "Live", description: "l", content: [], published: true });

			const count = await getPostCount();
			expect(count).toBe(1);
		});
	});

	describe("getRecentPosts", () => {
		it("returns most recent published posts", async () => {
			await createPost({ slug: "a", title: "A", description: "d", content: [], published: true });
			await createPost({ slug: "b", title: "B", description: "d", content: [], published: true });
			await createPost({ slug: "draft", title: "Draft", description: "d", content: [] });

			const recent = await getRecentPosts(5);
			expect(recent).toHaveLength(2);
		});

		it("excludes future-scheduled posts", async () => {
			await createPost({ slug: "live-recent", title: "Live", description: "d", content: [], published: true });
			await createPost({
				slug: "future-recent",
				title: "Future",
				description: "d",
				content: [],
				published: true,
				scheduledPublishAt: "2099-01-01T00:00:00Z",
			});

			const recent = await getRecentPosts(5);
			expect(recent).toHaveLength(1);
			expect(recent[0].slug).toBe("live-recent");
		});
	});

	describe("getAllPosts", () => {
		it("returns all posts including drafts", async () => {
			await createPost({ slug: "draft", title: "Draft", description: "d", content: [] });
			await createPost({ slug: "live", title: "Live", description: "l", content: [], published: true });

			const all = await getAllPosts();
			expect(all).toHaveLength(2);
		});
	});

	describe("getRelatedPosts", () => {
		it("returns posts with matching tags", async () => {
			await createPost({ slug: "a", title: "A", description: "d", content: [], tags: ["js", "react"], published: true });
			await createPost({ slug: "b", title: "B", description: "d", content: [], tags: ["js", "vue"], published: true });
			await createPost({ slug: "c", title: "C", description: "d", content: [], tags: ["python"], published: true });

			const related = await getRelatedPosts("a", ["js"]);
			expect(related).toHaveLength(1);
			expect(related[0].slug).toBe("b");
		});

		it("excludes the current post", async () => {
			await createPost({ slug: "self", title: "Self", description: "d", content: [], tags: ["js"], published: true });
			const related = await getRelatedPosts("self", ["js"]);
			expect(related).toHaveLength(0);
		});

		it("returns empty for no tags", async () => {
			const related = await getRelatedPosts("any", []);
			expect(related).toHaveLength(0);
		});
	});
});
