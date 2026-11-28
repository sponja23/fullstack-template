import type { Meta, RouterParameters, StoryObj } from "@storybook/tanstack-react";
import { screen, userEvent } from "storybook/test";
import { storyRoute } from "@/routes/-story-route";

const parents = {
    "/_authenticated": { beforeLoad: () => {} },
    "/_authenticated/_shell/_dashboard": { beforeLoad: () => {} },
};
const base: RouterParameters<undefined, "/projects/"> = {
    route: storyRoute("/_authenticated/_shell/_dashboard/projects/"),
    path: "/projects/",
    routeOverrides: parents,
};
const meta = {
    title: "pages/Projects/List",
    parameters: { layout: "fullscreen", tanstack: { router: base } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Populated: Story = { parameters: { env: { world: "acmeAgency" } } };
export const Empty: Story = { parameters: { env: { world: "emptyOrg" } } };
export const InvalidSlug: Story = {
    parameters: { env: { world: "acmeAgency" } },
    play: async () => {
        await userEvent.click(await screen.findByRole("button", { name: "New project" }));
        const slug = await screen.findByLabelText("Slug");
        await userEvent.type(slug, "Bad Slug");
        await userEvent.tab();
        await screen.findByText("Use lowercase letters, numbers, and hyphens");
        await userEvent.clear(slug);
        await userEvent.type(slug, "a".repeat(61));
        await userEvent.tab();
        await screen.findByText("Keep the slug to 60 characters");
    },
};
export const Loading: Story = {
    parameters: {
        env: { world: "emptyOrg" },
        tanstack: {
            router: {
                ...base,
                routeOverrides: {
                    ...parents,
                    "/_authenticated/_shell/_dashboard/projects/": {
                        loader: () => new Promise(() => {}),
                    },
                },
            } as RouterParameters<undefined, "/projects/">,
        },
    },
};
export const Error: Story = {
    parameters: {
        env: { world: "emptyOrg" },
        tanstack: {
            router: {
                ...base,
                routeOverrides: {
                    ...parents,
                    "/_authenticated/_shell/_dashboard/projects/": {
                        loader: () => {
                            throw new globalThis.Error("Projects unavailable");
                        },
                    },
                },
            } as RouterParameters<undefined, "/projects/">,
        },
    },
};
