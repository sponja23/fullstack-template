import { isAbsolute } from "node:path";
import { defineConfig } from "vite-plus";

export default defineConfig({
    build: {
        target: "node22",
        outDir: "dist",
        sourcemap: "inline",
        minify: false,
        lib: { entry: { index: "src/index.ts" }, formats: ["es"] },
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
