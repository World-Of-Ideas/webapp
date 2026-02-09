import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export async function getDb() {
	const { env } = await getCloudflareContext({ async: true });
	return drizzle((env as unknown as Record<string, unknown>).DB as D1Database, { schema });
}

export async function getEnv(): Promise<CloudflareEnv> {
	const { env } = await getCloudflareContext({ async: true });
	return env as CloudflareEnv;
}

export type DbClient = Awaited<ReturnType<typeof getDb>>;
