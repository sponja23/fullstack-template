import type { Meta, RouterParameters, StoryObj } from "@storybook/tanstack-react";
import { storyRoute } from "@/routes/-story-route";

const base: RouterParameters<undefined, "/"> = {
    route: storyRoute("/_authenticated/_shell/_dashboard/"),
    path: "/",
    routeOverrides: {
        "/_authenticated": { beforeLoad: () => {} },
        "/_authenticated/_shell/_dashboard": { beforeLoad: () => {} },
    },
};
const meta = {
    title: "pages/Dashboard",
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
                    "/_authenticated/_shell/_dashboard/": { loader: () => new Promise(() => {}) },
                },
            },
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
                    "/_authenticated/_shell/_dashboard/": {
                        loader: () => {
                            throw new globalThis.Error("Dashboard unavailable");
                        },
                    },
                },
            },
        },
    },
};
