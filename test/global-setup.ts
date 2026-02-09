/**
 * Global setup — runs once before all test files.
 * Applies D1 migrations via wrangler CLI to ensure the local DB is up to date.
 */
import { execSync } from "child_process";

export async function setup() {
	execSync("npx wrangler d1 migrations apply DB --local", {
		cwd: process.cwd(),
		stdio: "pipe",
	});
}
