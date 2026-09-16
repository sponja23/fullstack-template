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
        overrides: [
            {
                files: ["packages/ui/src/components/ui/chart.tsx"],
                // The generated Recharts payload keys include callable union members.
                rules: { "typescript/restrict-template-expressions": "off" },
            },
        ],
    },
    fmt: {
        tabWidth: 4,
        ignorePatterns: [
            ".context/**",
            "dist/**",
            "**/dist/**",
            "**/routeTree.gen.ts",
            // Preserve byte-identical shadcn output while still formatting colocated stories.
            "packages/ui/src/components/ui/*.tsx",
            "!packages/ui/src/components/ui/*.stories.tsx",
            "packages/ui/src/hooks/use-mobile.ts",
            "packages/ui/src/lib/utils.ts",
            "packages/ui/src/styles/globals.css",
        ],
        overrides: [
            {
                files: ["*.json", "*.jsonc", "*.json5", "*.yml", "*.yaml", "*.md", "*.mdx"],
                options: { tabWidth: 2 },
            },
        ],
    },
});
