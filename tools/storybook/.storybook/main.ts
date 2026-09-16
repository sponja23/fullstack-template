import tailwindcss from "@tailwindcss/vite";
import type { StorybookConfig } from "@storybook/tanstack-react";
import { mergeConfig } from "vite";
import { define, resolve } from "../vite.config.ts";

const config: StorybookConfig = {
    framework: "@storybook/tanstack-react",
    stories: [
        "../../../packages/ui/src/**/*.stories.@(ts|tsx)",
        "../../../apps/website/src/**/*.stories.@(ts|tsx)",
    ],
    addons: ["@storybook/addon-docs"],
    viteFinal: (viteConfig) =>
        mergeConfig(viteConfig, { resolve, define, plugins: [tailwindcss()] }),
};

export default config;
