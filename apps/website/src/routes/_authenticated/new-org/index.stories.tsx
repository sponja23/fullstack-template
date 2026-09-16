import type { Meta, RouterParameters, StoryObj } from "@storybook/tanstack-react";
import { storyRoute } from "@/routes/-story-route";

const base: RouterParameters<undefined, "/new-org/"> = {
    route: storyRoute("/_authenticated/new-org/"),
    path: "/new-org/",
    routeOverrides: { "/_authenticated": { beforeLoad: () => {} } },
};
const meta = {
    title: "pages/New organization",
    parameters: { layout: "fullscreen", tanstack: { router: base } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Populated: Story = { parameters: { env: { world: "acmeAgency" } } };
export const Empty: Story = { parameters: { env: { world: "emptyOrg" } } };
export const Loading: Story = {
    parameters: {
        env: { world: "emptyOrg" },
        tanstack: {
            router: {
                ...base,
                routeOverrides: {
                    ...base.routeOverrides,
                    "/_authenticated/new-org/": { loader: () => new Promise(() => {}) },
                },
            } as typeof base,
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
                    ...base.routeOverrides,
                    "/_authenticated/new-org/": {
                        loader: () => {
                            throw new globalThis.Error("Organization form unavailable");
                        },
                    },
                },
            } as typeof base,
        },
    },
};
