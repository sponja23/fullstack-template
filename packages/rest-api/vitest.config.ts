import { defineConfig } from "vitest/config";

export default defineConfig({
    resolve: { conditions: ["@repo/source"] },
    ssr: { resolve: { conditions: ["@repo/source"] } },
    test: { include: ["src/**/*.test.ts"], pool: "forks" },
});
