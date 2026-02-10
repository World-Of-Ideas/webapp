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
		coverage: {
			provider: "v8",
			include: ["src/lib/**/*.ts"],
			exclude: ["src/lib/__tests__/**"],
			thresholds: {
				lines: 70,
				functions: 70,
				branches: 70,
			},
		},
	},
	resolve: {
		alias: { "@": path.resolve(__dirname, "src") },
	},
});
