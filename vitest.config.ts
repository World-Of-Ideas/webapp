import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
	test: {
		include: ["src/**/*.test.ts"],
		environment: "node",
		globalSetup: ["./test/global-setup.ts"],
		setupFiles: ["./test/setup.ts"],
		// Integration tests modify shared DB state — run sequentially
		fileParallelism: false,
	},
	resolve: {
		alias: { "@": path.resolve(__dirname, "src") },
	},
});
