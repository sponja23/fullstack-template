/// <reference types="vite/client" />

import type { Preview } from "@storybook/tanstack-react";
import { createStoryRouterContext, withStoryEnv } from "../src/story-env";
import "./preview.css";

const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
const applyColorScheme = ({ matches }: Pick<MediaQueryList, "matches">) => {
    document.documentElement.classList.toggle("dark", matches);
};

applyColorScheme(colorScheme);
colorScheme.addEventListener("change", applyColorScheme);

const preview: Preview = {
    decorators: [withStoryEnv],
    parameters: {
        controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
        tanstack: { router: { path: "/", context: createStoryRouterContext } },
    },
};

export default preview;
