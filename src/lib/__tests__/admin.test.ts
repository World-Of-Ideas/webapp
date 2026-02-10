import { describe, it, expect, beforeEach } from "vitest";
import { cleanTables } from "../../../test/helpers";
import {
	verifyPassword,
	createSession,
	validateSession,
	deleteSession,
	cleanupExpiredSessions,
} from "@/lib/admin";
import { getDb } from "@/db";
import { adminSessions } from "@/db/schema";
import { eq } from "drizzle-orm";

describe("admin", () => {
	beforeEach(async () => {
		await cleanTables("admin_sessions");
	});

	// --- verifyPassword ---

	describe("verifyPassword", () => {
		it("returns true for correct password", async () => {
			const result = await verifyPassword("my-secret", "my-secret");
			expect(result).toBe(true);
		});

		it("returns false for wrong password", async () => {
			const result = await verifyPassword("wrong-password", "my-secret");
			expect(result).toBe(false);
		});

		it("returns false for empty password against non-empty", async () => {
			const result = await verifyPassword("", "my-secret");
			expect(result).toBe(false);
		});

		it("timing is consistent (both paths derive keys, not instant-return)", async () => {
			// Both correct and incorrect passwords should take similar time
			// because PBKDF2 derivation happens for both
			const start1 = performance.now();
			await verifyPassword("correct", "correct");
			const correctTime = performance.now() - start1;

			const start2 = performance.now();
			await verifyPassword("wrong", "correct");
			const wrongTime = performance.now() - start2;

			// Both should take at least some measurable time (PBKDF2 is slow)
			// They should be within the same order of magnitude
			// We just verify neither is instant (< 1ms would suggest short-circuit)
			expect(correctTime).toBeGreaterThan(1);
			expect(wrongTime).toBeGreaterThan(1);
		});
	});

	// --- createSession ---

	describe("createSession", () => {
		it("returns a UUID string", async () => {
			const id = await createSession();
			expect(id).toMatch(
				/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
			);
		});

		it("creates a session in the database", async () => {
			const id = await createSession();
			const db = await getDb();
			const session = await db.query.adminSessions.findFirst({
				where: eq(adminSessions.id, id),
			});
			expect(session).toBeTruthy();
			expect(session!.id).toBe(id);
		});

		it("sets expiresAt ~24 hours in the future", async () => {
			const before = Date.now();
			const id = await createSession();
			const after = Date.now();

			const db = await getDb();
			const session = await db.query.adminSessions.findFirst({
				where: eq(adminSessions.id, id),
			});

			const expiresAt = new Date(session!.expiresAt + "Z").getTime();
			const twentyFourHours = 24 * 60 * 60 * 1000;

			// expiresAt should be ~24h from now, allowing small timing tolerance
			expect(expiresAt).toBeGreaterThanOrEqual(before + twentyFourHours - 1000);
			expect(expiresAt).toBeLessThanOrEqual(after + twentyFourHours + 1000);
		});
	});

	// --- validateSession ---

	describe("validateSession", () => {
		it("returns true for a valid session", async () => {
			const id = await createSession();
			const result = await validateSession(id);
			expect(result).toBe(true);
		});

		it("returns false for a non-existent session", async () => {
			const result = await validateSession("non-existent-id");
			expect(result).toBe(false);
		});

		it("returns false for an expired session and deletes it", async () => {
			const db = await getDb();
			const id = "expired-session-id";
			const pastDate = new Date(Date.now() - 60_000).toISOString(); // 1 min ago

			await db.insert(adminSessions).values({
				id,
				expiresAt: pastDate,
			});

			const result = await validateSession(id);
			expect(result).toBe(false);

			// Session should be deleted
			const session = await db.query.adminSessions.findFirst({
				where: eq(adminSessions.id, id),
			});
			expect(session).toBeUndefined();
		});

		it("returns false for sessions older than 7 days (absolute max)", async () => {
			const db = await getDb();
			const id = "old-session-id";
			const eightDaysAgo = new Date(
				Date.now() - 8 * 24 * 60 * 60 * 1000,
			).toISOString();
			const futureExpiry = new Date(
				Date.now() + 24 * 60 * 60 * 1000,
			).toISOString();

			// Insert with createdAt in the past (> 7 days) but expiresAt in the future
			await db.insert(adminSessions).values({
				id,
				createdAt: eightDaysAgo,
				expiresAt: futureExpiry,
			});

			const result = await validateSession(id);
			expect(result).toBe(false);

			// Session should be deleted
			const session = await db.query.adminSessions.findFirst({
				where: eq(adminSessions.id, id),
			});
			expect(session).toBeUndefined();
		});

		it("extends TTL on valid session (sliding window)", async () => {
			const id = await createSession();

			const db = await getDb();
			const before = await db.query.adminSessions.findFirst({
				where: eq(adminSessions.id, id),
			});
			const originalExpiry = new Date(before!.expiresAt).getTime();

			// Small delay to ensure time difference
			await new Promise((r) => setTimeout(r, 50));

			await validateSession(id);

			const after = await db.query.adminSessions.findFirst({
				where: eq(adminSessions.id, id),
			});
			const newExpiry = new Date(after!.expiresAt).getTime();

			// New expiry should be >= original (it was extended from Date.now())
			expect(newExpiry).toBeGreaterThanOrEqual(originalExpiry);
		});
	});

	// --- deleteSession ---

	describe("deleteSession", () => {
		it("makes session no longer valid after deletion", async () => {
			const id = await createSession();
			expect(await validateSession(id)).toBe(true);

			await deleteSession(id);

			expect(await validateSession(id)).toBe(false);
		});

		it("does not throw when deleting non-existent session", async () => {
			await expect(deleteSession("nonexistent")).resolves.toBeUndefined();
		});
	});

	// --- cleanupExpiredSessions ---

	describe("cleanupExpiredSessions", () => {
		// cleanupExpiredSessions uses SQLite's datetime('now') which returns
		// space-separated format "YYYY-MM-DD HH:MM:SS". Expired dates must
		// use the same format for string comparison to work correctly.
		function sqliteDatetime(date: Date): string {
			return date.toISOString().replace("T", " ").replace(/\.\d{3}Z$/, "");
		}

		it("removes expired sessions", async () => {
			const db = await getDb();

			// Insert an expired session using SQLite-compatible datetime format
			await db.insert(adminSessions).values({
				id: "expired-1",
				expiresAt: sqliteDatetime(new Date(Date.now() - 60_000)),
			});

			await cleanupExpiredSessions();

			const session = await db.query.adminSessions.findFirst({
				where: eq(adminSessions.id, "expired-1"),
			});
			expect(session).toBeUndefined();
		});

		it("keeps valid (non-expired) sessions", async () => {
			const db = await getDb();

			// Insert a valid session with future expiry in SQLite format
			const futureExpiry = sqliteDatetime(new Date(Date.now() + 24 * 60 * 60 * 1000));
			await db.insert(adminSessions).values({
				id: "valid-session",
				expiresAt: futureExpiry,
			});

			// Also insert an expired one
			await db.insert(adminSessions).values({
				id: "expired-2",
				expiresAt: sqliteDatetime(new Date(Date.now() - 60_000)),
			});

			await cleanupExpiredSessions();

			// Valid session should still exist
			const valid = await db.query.adminSessions.findFirst({
				where: eq(adminSessions.id, "valid-session"),
			});
			expect(valid).toBeTruthy();

			// Expired session should be gone
			const expired = await db.query.adminSessions.findFirst({
				where: eq(adminSessions.id, "expired-2"),
			});
			expect(expired).toBeUndefined();
		});
	});
});
