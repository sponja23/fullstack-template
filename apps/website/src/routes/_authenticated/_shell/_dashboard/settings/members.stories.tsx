import type { Meta, RouterParameters, StoryObj } from "@storybook/tanstack-react";
import { storyRoute } from "@/routes/-story-route";

const parents = {
    "/_authenticated": { beforeLoad: () => {} },
    "/_authenticated/_shell/_dashboard": { beforeLoad: () => {} },
    "/_authenticated/_shell/_dashboard/settings": { loader: () => null },
};
const base: RouterParameters<undefined, "/settings/members"> = {
    route: storyRoute("/_authenticated/_shell/_dashboard/settings/members"),
    path: "/settings/members",
    routeOverrides: parents,
};
const meta = {
    title: "pages/Settings/Members",
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
                    "/_authenticated/_shell/_dashboard/settings/members": {
                        loader: () => new Promise(() => {}),
                    },
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
                    ...parents,
                    "/_authenticated/_shell/_dashboard/settings/members": {
                        loader: () => {
                            throw new globalThis.Error("Members unavailable");
                        },
                    },
                },
            } as typeof base,
        },
    },
};
