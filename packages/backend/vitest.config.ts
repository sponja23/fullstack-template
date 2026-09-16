import { defineConfig } from "vitest/config";

export default defineConfig({
    resolve: { conditions: ["@repo/source"] },
    ssr: { resolve: { conditions: ["@repo/source"] } },
    test: {
        include: ["test/**/*.test.ts", "src/**/*.test.ts"],
        globalSetup: ["./test/global-setup.ts"],
        testTimeout: 15_000,
        hookTimeout: 120_000,
        pool: "forks",
        fileParallelism: true,
    },
});
