import { count } from "drizzle-orm";
import { getDb } from "@/db";
import { contactSubmissions } from "@/db/schema";

export async function createContactSubmission(data: {
	name: string;
	email: string;
	message: string;
}) {
	const db = await getDb();
	const [submission] = await db
		.insert(contactSubmissions)
		.values(data)
		.returning();
	return submission;
}

export async function getContactSubmissions(page: number, limit: number) {
	const db = await getDb();
	const offset = (page - 1) * limit;

	const [items, [{ total }]] = await Promise.all([
		db.query.contactSubmissions.findMany({
			orderBy: (c, { desc }) => [desc(c.createdAt)],
			limit,
			offset,
		}),
		db.select({ total: count() }).from(contactSubmissions),
	]);

	return { items, total };
}

export async function getContactCount() {
	const db = await getDb();
	const [{ total }] = await db
		.select({ total: count() })
		.from(contactSubmissions);
	return total;
}
