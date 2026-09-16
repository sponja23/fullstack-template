import type { Meta, RouterParameters, StoryObj } from "@storybook/tanstack-react";
import { storyRoute } from "@/routes/-story-route";

const base: RouterParameters<undefined, "/onboarding/"> = {
    route: storyRoute("/_authenticated/onboarding/"),
    path: "/onboarding/",
    routeOverrides: {
        "/_authenticated": { beforeLoad: () => {} },
        "/_authenticated/onboarding/": { beforeLoad: () => {} },
    },
};
const meta = {
    title: "pages/Onboarding",
    parameters: { layout: "fullscreen", tanstack: { router: base } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Populated: Story = { parameters: { env: { world: "acmeAgency" } } };
export const Empty: Story = {
    parameters: {
        env: { world: "emptyOrg", queries: [{ queryKey: ["organizations", "list"], data: [] }] },
    },
};
export const Loading: Story = {
    parameters: {
        env: { world: "emptyOrg" },
        tanstack: {
            router: {
                ...base,
                routeOverrides: {
                    ...base.routeOverrides,
                    "/_authenticated/onboarding/": { beforeLoad: () => new Promise(() => {}) },
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
                    "/_authenticated/onboarding/": {
                        beforeLoad: () => {
                            throw new globalThis.Error("Onboarding unavailable");
                        },
                    },
                },
            },
        },
    },
};
