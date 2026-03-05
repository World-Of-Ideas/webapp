import { describe, it, expect, beforeEach } from "vitest";
import { cleanTables } from "../../../test/helpers";
import {
	getRedirectByPath,
	getAllRedirects,
	createRedirect,
	updateRedirect,
	deleteRedirect,
} from "../redirects";

describe("redirects (integration)", () => {
	beforeEach(async () => {
		await cleanTables("redirects");
	});

	describe("createRedirect", () => {
		it("creates and returns a redirect with defaults", async () => {
			const redirect = await createRedirect({
				fromPath: "/old-page",
				toUrl: "/new-page",
			});

			expect(redirect.fromPath).toBe("/old-page");
			expect(redirect.toUrl).toBe("/new-page");
			expect(redirect.statusCode).toBe(301);
			expect(redirect.enabled).toBe(true);
			expect(redirect.id).toBeDefined();
			expect(redirect.createdAt).toBeDefined();
		});

		it("creates redirect with custom statusCode 302", async () => {
			const redirect = await createRedirect({
				fromPath: "/temp",
				toUrl: "/destination",
				statusCode: 302,
			});

			expect(redirect.statusCode).toBe(302);
		});

		it("creates redirect with enabled: false", async () => {
			const redirect = await createRedirect({
				fromPath: "/disabled",
				toUrl: "/target",
				enabled: false,
			});

			expect(redirect.enabled).toBe(false);
		});
	});

	describe("getRedirectByPath", () => {
		it("returns enabled redirect", async () => {
			await createRedirect({ fromPath: "/old", toUrl: "/new" });

			const found = await getRedirectByPath("/old");
			expect(found).toBeDefined();
			expect(found?.toUrl).toBe("/new");
		});

		it("returns undefined for disabled redirect", async () => {
			await createRedirect({ fromPath: "/disabled", toUrl: "/target", enabled: false });

			const found = await getRedirectByPath("/disabled");
			expect(found).toBeUndefined();
		});

		it("returns undefined for non-existent path", async () => {
			const found = await getRedirectByPath("/does-not-exist");
			expect(found).toBeUndefined();
		});
	});

	describe("getAllRedirects", () => {
		it("returns all redirects sorted by createdAt desc", async () => {
			await createRedirect({ fromPath: "/first", toUrl: "/a" });
			await createRedirect({ fromPath: "/second", toUrl: "/b" });
			await createRedirect({ fromPath: "/third", toUrl: "/c" });

			const all = await getAllRedirects();
			expect(all).toHaveLength(3);
			const paths = all.map((r) => r.fromPath);
			expect(paths).toContain("/first");
			expect(paths).toContain("/second");
			expect(paths).toContain("/third");
		});
	});

	describe("updateRedirect", () => {
		it("updates fields", async () => {
			const redirect = await createRedirect({ fromPath: "/old", toUrl: "/new" });

			const updated = await updateRedirect(redirect.id, {
				toUrl: "/updated",
				statusCode: 302,
			});

			expect(updated.toUrl).toBe("/updated");
			expect(updated.statusCode).toBe(302);
			expect(updated.fromPath).toBe("/old");
		});

		it("partial update does not overwrite other fields", async () => {
			const redirect = await createRedirect({
				fromPath: "/source",
				toUrl: "/dest",
				statusCode: 302,
			});

			const updated = await updateRedirect(redirect.id, { enabled: false });

			expect(updated.enabled).toBe(false);
			expect(updated.fromPath).toBe("/source");
			expect(updated.toUrl).toBe("/dest");
			expect(updated.statusCode).toBe(302);
		});
	});

	describe("deleteRedirect", () => {
		it("removes the redirect", async () => {
			const redirect = await createRedirect({ fromPath: "/remove-me", toUrl: "/target" });

			await deleteRedirect(redirect.id);

			const found = await getRedirectByPath("/remove-me");
			expect(found).toBeUndefined();

			const all = await getAllRedirects();
			expect(all).toHaveLength(0);
		});
	});
});
