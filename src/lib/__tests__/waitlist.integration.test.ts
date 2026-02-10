import { describe, it, expect, beforeEach } from "vitest";
import { cleanTables } from "../../../test/helpers";
import {
	createSubscriber,
	createSubscriberWithReferral,
	getSubscriberByEmail,
	getSubscriberByReferralCode,
	incrementReferralCount,
	getSubscriberCount,
	unsubscribe,
	getSubscribers,
} from "../waitlist";

describe("waitlist (integration)", () => {
	beforeEach(async () => {
		await cleanTables("giveaway_actions", "giveaway_entries", "subscribers");
	});

	describe("createSubscriber", () => {
		it("inserts a subscriber and returns it", async () => {
			const sub = await createSubscriber({
				email: "alice@test.com",
				name: "Alice",
				referralCode: "abc123",
			});

			expect(sub.email).toBe("alice@test.com");
			expect(sub.name).toBe("Alice");
			expect(sub.referralCode).toBe("abc123");
			expect(sub.position).toBe(1);
			expect(sub.status).toBe("active");
			expect(sub.referralCount).toBe(0);
		});

		it("assigns incrementing positions", async () => {
			const s1 = await createSubscriber({ email: "a@test.com", name: "A", referralCode: "aaa" });
			const s2 = await createSubscriber({ email: "b@test.com", name: "B", referralCode: "bbb" });
			expect(s1.position).toBe(1);
			expect(s2.position).toBe(2);
		});

		it("stores referredBy when provided", async () => {
			const sub = await createSubscriber({
				email: "bob@test.com",
				name: "Bob",
				referralCode: "def456",
				referredBy: "abc123",
			});
			expect(sub.referredBy).toBe("abc123");
		});
	});

	describe("getSubscriberByEmail", () => {
		it("returns the subscriber when found", async () => {
			await createSubscriber({ email: "alice@test.com", name: "Alice", referralCode: "abc123" });
			const sub = await getSubscriberByEmail("alice@test.com");
			expect(sub?.email).toBe("alice@test.com");
		});

		it("returns undefined when not found", async () => {
			const sub = await getSubscriberByEmail("nobody@test.com");
			expect(sub).toBeUndefined();
		});
	});

	describe("getSubscriberByReferralCode", () => {
		it("finds subscriber by referral code", async () => {
			await createSubscriber({ email: "alice@test.com", name: "Alice", referralCode: "abc123" });
			const sub = await getSubscriberByReferralCode("abc123");
			expect(sub?.email).toBe("alice@test.com");
		});
	});

	describe("incrementReferralCount", () => {
		it("atomically increments the referral count", async () => {
			await createSubscriber({ email: "alice@test.com", name: "Alice", referralCode: "abc123" });

			await incrementReferralCount("abc123");
			await incrementReferralCount("abc123");

			const sub = await getSubscriberByReferralCode("abc123");
			expect(sub?.referralCount).toBe(2);
		});
	});

	describe("getSubscriberCount", () => {
		it("counts only active subscribers", async () => {
			await createSubscriber({ email: "a@test.com", name: "A", referralCode: "aaa" });
			await createSubscriber({ email: "b@test.com", name: "B", referralCode: "bbb" });
			await unsubscribe("b@test.com");

			const count = await getSubscriberCount();
			expect(count).toBe(1);
		});
	});

	describe("unsubscribe", () => {
		it("sets status to unsubscribed", async () => {
			await createSubscriber({ email: "alice@test.com", name: "Alice", referralCode: "abc123" });
			await unsubscribe("alice@test.com");

			const sub = await getSubscriberByEmail("alice@test.com");
			expect(sub?.status).toBe("unsubscribed");
		});
	});

	describe("createSubscriberWithReferral", () => {
		it("creates subscriber with referral and increments referrer's referralCount", async () => {
			const referrer = await createSubscriber({
				email: "referrer@test.com",
				name: "Referrer",
				referralCode: "ref001",
			});
			expect(referrer.referralCount).toBe(0);

			const referred = await createSubscriberWithReferral({
				email: "referred@test.com",
				name: "Referred",
				referralCode: "ref002",
				referredBy: "ref001",
			});

			expect(referred.email).toBe("referred@test.com");
			expect(referred.referredBy).toBe("ref001");

			const updatedReferrer = await getSubscriberByReferralCode("ref001");
			expect(updatedReferrer?.referralCount).toBe(1);
		});

		it("creates subscriber even if referredBy code doesn't match any existing subscriber", async () => {
			const sub = await createSubscriberWithReferral({
				email: "orphan@test.com",
				name: "Orphan",
				referralCode: "orph01",
				referredBy: "nonexistent-code",
			});

			expect(sub.email).toBe("orphan@test.com");
			expect(sub.referredBy).toBe("nonexistent-code");

			const found = await getSubscriberByEmail("orphan@test.com");
			expect(found).toBeDefined();
		});
	});

	describe("getSubscribers", () => {
		it("returns paginated subscribers with total", async () => {
			for (let i = 0; i < 5; i++) {
				await createSubscriber({
					email: `user${i}@test.com`,
					name: `User ${i}`,
					referralCode: `code${i}`,
				});
			}

			const { items, total } = await getSubscribers(1, 2);
			expect(items).toHaveLength(2);
			expect(total).toBe(5);
		});

		it("respects page offset", async () => {
			for (let i = 0; i < 3; i++) {
				await createSubscriber({
					email: `user${i}@test.com`,
					name: `User ${i}`,
					referralCode: `code${i}`,
				});
			}

			const page2 = await getSubscribers(2, 2);
			expect(page2.items).toHaveLength(1);
		});
	});
});
