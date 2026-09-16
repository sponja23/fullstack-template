import { isAbsolute } from "node:path";
import { defineConfig } from "vite-plus";

// Preserve the dynamic server import so telemetry patches HTTP and Postgres first.
export default defineConfig({
    build: {
        target: "node22",
        outDir: "dist",
        sourcemap: "inline",
        minify: false,
        lib: {
            entry: {
                index: "src/index.ts",
                migrate: "src/migrate.ts",
                "superadmin-grant": "src/superadmin-grant.ts",
            },
            formats: ["es"],
        },
        rollupOptions: {
            external: (id) => !id.startsWith(".") && !isAbsolute(id),
            output: {
                preserveModules: true,
                preserveModulesRoot: "src",
                entryFileNames: "[name].js",
            },
        },
    },
});
