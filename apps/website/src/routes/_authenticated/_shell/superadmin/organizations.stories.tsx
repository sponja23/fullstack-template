import type { Meta, RouterParameters, StoryObj } from "@storybook/tanstack-react";
import { storyRoute } from "@/routes/-story-route";

const base: RouterParameters<undefined, "/superadmin/organizations"> = {
    route: storyRoute("/_authenticated/_shell/superadmin/organizations"),
    path: "/superadmin/organizations",
    routeOverrides: {
        "/_authenticated": { beforeLoad: () => {} },
        "/_authenticated/_shell/superadmin": { beforeLoad: () => {} },
        "/_authenticated/_shell/superadmin/organizations": { loader: () => null },
    },
};
const meta = {
    title: "pages/Superadmin/Organizations",
    parameters: { layout: "fullscreen", tanstack: { router: base } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Populated: Story = { parameters: { env: { world: "acmeAgency" } } };
export const Empty: Story = { parameters: { env: { world: "emptyOrg" } } };
export const Loading: Story = {
    parameters: {
        env: {
            world: "acmeAgency",
            handlers: { "superadmin.organizations.list": () => new Promise(() => {}) },
        },
    },
};
export const Error: Story = {
    parameters: {
        env: {
            world: "acmeAgency",
            handlers: {
                "superadmin.organizations.list": () => {
                    throw new globalThis.Error("Organizations unavailable");
                },
            },
        },
    },
};
