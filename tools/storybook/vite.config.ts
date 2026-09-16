import { fileURLToPath } from "node:url";
import { defineConfig } from "vite-plus";

const websiteSrc = fileURLToPath(new URL("../../apps/website/src", import.meta.url));

export const resolve = {
    alias: [
        { find: /^@repo\/website\/(.*)$/, replacement: `${websiteSrc}/$1` },
        { find: /^@\/(.*)$/, replacement: `${websiteSrc}/$1` },
    ],
    conditions: ["@repo/source"],
};

export const define = {
    "import.meta.env.SKIP_ENV_VALIDATION": JSON.stringify("true"),
    "import.meta.env.VITE_API_URL": JSON.stringify("https://api.acme.test"),
};

export default defineConfig({ resolve, define });
