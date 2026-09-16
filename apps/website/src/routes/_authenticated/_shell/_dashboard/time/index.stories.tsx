import type { Meta, RouterParameters, StoryObj } from "@storybook/tanstack-react";
import { storyRoute } from "@/routes/-story-route";

const parents = {
    "/_authenticated": { beforeLoad: () => {} },
    "/_authenticated/_shell/_dashboard": { beforeLoad: () => {} },
};
const base: RouterParameters<undefined, "/time/"> = {
    route: storyRoute("/_authenticated/_shell/_dashboard/time/"),
    path: "/time/",
    routeOverrides: parents,
};
const meta = {
    title: "pages/Time",
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
                    "/_authenticated/_shell/_dashboard/time/": {
                        loader: () => new Promise(() => {}),
                    },
                },
            } as RouterParameters<undefined, "/time/">,
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
                    "/_authenticated/_shell/_dashboard/time/": {
                        loader: () => {
                            throw new globalThis.Error("Time unavailable");
                        },
                    },
                },
            } as RouterParameters<undefined, "/time/">,
        },
    },
};
