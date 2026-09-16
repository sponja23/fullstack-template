import { defineConfig } from "vite-plus";

export default defineConfig({
    staged: {
        "*": "vp check --fix",
    },
    run: {
        cache: true,
    },
    lint: {
        ignorePatterns: [".context/**", "dist/**", "**/dist/**"],
        options: { typeAware: true, typeCheck: true },
    },
    fmt: {
        tabWidth: 4,
        ignorePatterns: [".context/**", "dist/**", "**/dist/**", "**/routeTree.gen.ts"],
        overrides: [
            {
                files: ["*.json", "*.jsonc", "*.json5", "*.yml", "*.yaml", "*.md", "*.mdx"],
                options: { tabWidth: 2 },
            },
        ],
    },
});
