import type { Meta, RouterParameters, StoryObj } from "@storybook/tanstack-react";
import { storyRoute } from "@/routes/-story-route";

const parents = {
    "/_authenticated": { beforeLoad: () => {} },
    "/_authenticated/_shell/_dashboard": { beforeLoad: () => {} },
    "/_authenticated/_shell/_dashboard/settings": { loader: () => null },
};
const base: RouterParameters<undefined, "/settings/general"> = {
    route: storyRoute("/_authenticated/_shell/_dashboard/settings/general"),
    path: "/settings/general",
    routeOverrides: parents,
};
const meta = {
    title: "pages/Settings/General",
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
                    "/_authenticated/_shell/_dashboard/settings/general": {
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
                    "/_authenticated/_shell/_dashboard/settings/general": {
                        loader: () => {
                            throw new globalThis.Error("General settings unavailable");
                        },
                    },
                },
            } as typeof base,
        },
    },
};
