import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { define, resolve } from "./vite.config";

export default defineConfig({
    plugins: [react()],
    resolve,
    ssr: { resolve: { conditions: resolve.conditions } },
    define,
    test: {
        environment: "jsdom",
        include: ["src/**/*.test.{ts,tsx}"],
        setupFiles: ["src/jsdom-setup.ts"],
    },
});
