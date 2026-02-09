/**
 * Per-process setup — runs in the same process as tests.
 * Creates a getPlatformProxy and mocks @opennextjs/cloudflare
 * so that all lib functions using getDb()/getEnv() hit real local D1.
 */
import { vi, beforeAll, afterAll } from "vitest";
import { getPlatformProxy } from "wrangler";

// vi.hoisted runs before vi.mock hoisting — safe to reference in factory
const { proxyEnv } = vi.hoisted(() => {
	const proxyEnv: Record<string, unknown> = {};
	return { proxyEnv };
});

vi.mock("@opennextjs/cloudflare", () => ({
	getCloudflareContext: () =>
		Promise.resolve({
			env: proxyEnv,
			cf: {},
			ctx: { waitUntil: vi.fn() },
		}),
}));

let dispose: (() => Promise<void>) | undefined;

beforeAll(async () => {
	const proxy = await getPlatformProxy({ configPath: "./wrangler.jsonc" });
	dispose = proxy.dispose;
	Object.assign(proxyEnv, proxy.env);
});

afterAll(async () => {
	await dispose?.();
});
