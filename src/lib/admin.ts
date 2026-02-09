import { eq, lt, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { adminSessions } from "@/db/schema";

export async function createSession(): Promise<string> {
	const db = await getDb();
	const id = crypto.randomUUID();
	const now = new Date();
	const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

	await db.insert(adminSessions).values({
		id,
		expiresAt: expiresAt.toISOString(),
	});

	return id;
}

export async function validateSession(sessionId: string): Promise<boolean> {
	const db = await getDb();
	const session = await db.query.adminSessions.findFirst({
		where: eq(adminSessions.id, sessionId),
	});

	if (!session) return false;
	if (new Date(session.expiresAt) < new Date()) {
		await db.delete(adminSessions).where(eq(adminSessions.id, sessionId));
		return false;
	}

	return true;
}

export async function deleteSession(sessionId: string): Promise<void> {
	const db = await getDb();
	await db.delete(adminSessions).where(eq(adminSessions.id, sessionId));
}

export async function cleanupExpiredSessions(): Promise<void> {
	const db = await getDb();
	await db
		.delete(adminSessions)
		.where(lt(adminSessions.expiresAt, sql`datetime('now')`));
}

export async function verifyPassword(password: string, adminPassword: string): Promise<boolean> {
	// Constant-time comparison to prevent timing attacks
	if (password.length !== adminPassword.length) return false;
	const encoder = new TextEncoder();
	const a = encoder.encode(password);
	const b = encoder.encode(adminPassword);
	if (a.byteLength !== b.byteLength) return false;
	let result = 0;
	for (let i = 0; i < a.byteLength; i++) {
		result |= a[i] ^ b[i];
	}
	return result === 0;
}
