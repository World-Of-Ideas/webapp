import { describe, it, expect, beforeEach } from "vitest";
import { cleanTables } from "../../../test/helpers";
import {
	createContactSubmission,
	getContactSubmissions,
	getContactCount,
} from "../contact";

describe("contact (integration)", () => {
	beforeEach(async () => {
		await cleanTables("contact_submissions");
	});

	describe("createContactSubmission", () => {
		it("inserts and returns the submission", async () => {
			const sub = await createContactSubmission({
				name: "Alice",
				email: "alice@test.com",
				message: "Hello!",
			});

			expect(sub.name).toBe("Alice");
			expect(sub.email).toBe("alice@test.com");
			expect(sub.message).toBe("Hello!");
			expect(sub.id).toBeGreaterThan(0);
		});
	});

	describe("getContactSubmissions", () => {
		it("returns paginated results", async () => {
			for (let i = 0; i < 5; i++) {
				await createContactSubmission({
					name: `User ${i}`,
					email: `user${i}@test.com`,
					message: `Message ${i}`,
				});
			}

			const { items, total } = await getContactSubmissions(1, 3);
			expect(items).toHaveLength(3);
			expect(total).toBe(5);
		});
	});

	describe("getContactCount", () => {
		it("returns total submission count", async () => {
			await createContactSubmission({ name: "A", email: "a@t.com", message: "m" });
			await createContactSubmission({ name: "B", email: "b@t.com", message: "m" });

			const count = await getContactCount();
			expect(count).toBe(2);
		});
	});
});
