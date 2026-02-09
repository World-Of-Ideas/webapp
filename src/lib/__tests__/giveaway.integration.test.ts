import { describe, it, expect, beforeEach } from "vitest";
import { cleanTables } from "../../../test/helpers";
import {
	createGiveawayEntry,
	getGiveawayEntryByEmail,
	recordGiveawayAction,
	getGiveawayActions,
	getGiveawayEntries,
	getGiveawayStats,
} from "../giveaway";
import { createSubscriber } from "../waitlist";

describe("giveaway (integration)", () => {
	beforeEach(async () => {
		await cleanTables("giveaway_actions", "giveaway_entries", "subscribers");
	});

	describe("createGiveawayEntry", () => {
		it("creates an entry with default totalEntries = 1", async () => {
			const entry = await createGiveawayEntry({ email: "alice@test.com" });
			expect(entry.email).toBe("alice@test.com");
			expect(entry.totalEntries).toBe(1);
		});

		it("links to a subscriber when subscriberId provided", async () => {
			const sub = await createSubscriber({
				email: "alice@test.com",
				name: "Alice",
				referralCode: "abc123",
			});
			const entry = await createGiveawayEntry({
				email: "alice@test.com",
				subscriberId: sub.id,
			});
			expect(entry.subscriberId).toBe(sub.id);
		});
	});

	describe("getGiveawayEntryByEmail", () => {
		it("returns entry when found", async () => {
			await createGiveawayEntry({ email: "alice@test.com" });
			const entry = await getGiveawayEntryByEmail("alice@test.com");
			expect(entry?.email).toBe("alice@test.com");
		});

		it("returns undefined when not found", async () => {
			const entry = await getGiveawayEntryByEmail("nobody@test.com");
			expect(entry).toBeUndefined();
		});
	});

	describe("recordGiveawayAction", () => {
		it("records an action and increments totalEntries", async () => {
			const entry = await createGiveawayEntry({ email: "alice@test.com" });

			await recordGiveawayAction({
				entryId: entry.id,
				action: "twitter_follow",
				bonusEntries: 3,
			});

			const updated = await getGiveawayEntryByEmail("alice@test.com");
			expect(updated?.totalEntries).toBe(4); // 1 base + 3 bonus

			const actions = await getGiveawayActions(entry.id);
			expect(actions).toHaveLength(1);
			expect(actions[0].action).toBe("twitter_follow");
			expect(actions[0].bonusEntries).toBe(3);
		});

		it("rejects duplicate actions (unique constraint)", async () => {
			const entry = await createGiveawayEntry({ email: "alice@test.com" });

			await recordGiveawayAction({ entryId: entry.id, action: "twitter_follow", bonusEntries: 2 });

			await expect(
				recordGiveawayAction({ entryId: entry.id, action: "twitter_follow", bonusEntries: 2 }),
			).rejects.toThrow();
		});
	});

	describe("getGiveawayEntries", () => {
		it("returns paginated entries", async () => {
			for (let i = 0; i < 5; i++) {
				await createGiveawayEntry({ email: `user${i}@test.com` });
			}

			const { items, total } = await getGiveawayEntries(1, 3);
			expect(items).toHaveLength(3);
			expect(total).toBe(5);
		});
	});

	describe("getGiveawayStats", () => {
		it("returns total entries and actions", async () => {
			const entry = await createGiveawayEntry({ email: "alice@test.com" });
			await createGiveawayEntry({ email: "bob@test.com" });
			await recordGiveawayAction({ entryId: entry.id, action: "twitter_follow", bonusEntries: 2 });

			const stats = await getGiveawayStats();
			expect(stats.totalEntries).toBe(2);
			expect(stats.totalActions).toBe(1);
		});
	});
});
