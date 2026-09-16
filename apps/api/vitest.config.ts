import { defineConfig } from "vitest/config";

export default defineConfig({
    resolve: { conditions: ["@repo/source"] },
    ssr: { resolve: { conditions: ["@repo/source"] } },
    test: {
        include: ["test/**/*.test.ts"],
        hookTimeout: 180_000,
        testTimeout: 60_000,
    },
});
