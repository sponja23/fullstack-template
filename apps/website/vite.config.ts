import { fileURLToPath } from "node:url";
import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { defineConfig } from "vite-plus";

const source = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
    envDir: "../..",
    resolve: {
        alias: { "@": source },
        conditions: ["@repo/source"],
    },
    plugins: [
        tanstackRouter({
            target: "react",
            autoCodeSplitting: true,
            quoteStyle: "double",
            routeFileIgnorePattern: "\\.stories\\.",
        }),
        react(),
        babel({ presets: [reactCompilerPreset()] }),
        tailwindcss(),
    ],
    server: { port: 5173 },
    lint: { options: { typeAware: true, typeCheck: true } },
});
