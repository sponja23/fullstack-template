import { act, type FC } from "react";
import { afterEach, describe, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { composeStories, setProjectAnnotations } from "@storybook/tanstack-react";
import preview from "../.storybook/preview";

setProjectAnnotations([preview]);

const storyModules = import.meta.glob(
    ["../../../packages/ui/src/**/*.stories.tsx", "../../../apps/website/src/**/*.stories.tsx"],
    { eager: true },
);

type ComposedStory = FC & {
    load: () => Promise<void>;
    parameters?: { tanstack?: unknown };
};

describe("stories render without throwing", () => {
    afterEach(cleanup);

    for (const [path, module] of Object.entries(storyModules)) {
        const composed = composeStories(module as Parameters<typeof composeStories>[0]);
        for (const [name, story] of Object.entries(composed)) {
            const Story = story as ComposedStory;
            const routeMounted = Boolean(Story.parameters?.tanstack);
            it(`${path} → ${name}${routeMounted ? " (browser-rendered)" : ""}`, async () => {
                await Story.load();
                if (routeMounted) return;
                await act(async () => {
                    render(<Story />);
                });
            });
        }
    }
});
