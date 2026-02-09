import { getDb } from "@/db";
import { sql } from "drizzle-orm";

/**
 * Deletes all rows from the given tables (in order).
 * Use in beforeEach to ensure test isolation.
 */
export async function cleanTables(...tables: string[]) {
	const db = await getDb();
	for (const table of tables) {
		await db.run(sql.raw(`DELETE FROM ${table}`));
	}
}
