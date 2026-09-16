import type { Meta, RouterParameters, StoryObj } from "@storybook/tanstack-react";
import { storyRoute } from "@/routes/-story-route";

const parents = { "/_authenticated": { beforeLoad: () => {} } };
const base: RouterParameters<undefined, "/account/"> = {
    route: storyRoute("/_authenticated/_shell/account/"),
    path: "/account/",
    routeOverrides: parents,
};
const meta = {
    title: "pages/Account",
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
                    ...parents,
                    "/_authenticated/_shell/account/": { loader: () => new Promise(() => {}) },
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
                    ...parents,
                    "/_authenticated/_shell/account/": {
                        loader: () => {
                            throw new globalThis.Error("Account unavailable");
                        },
                    },
                },
            },
        },
    },
};
