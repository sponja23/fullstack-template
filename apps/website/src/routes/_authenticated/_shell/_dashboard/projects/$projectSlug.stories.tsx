import type { Meta, RouterParameters, StoryObj } from "@storybook/tanstack-react";
import { storyRoute } from "@/routes/-story-route";

const parents = {
    "/_authenticated": { beforeLoad: () => {} },
    "/_authenticated/_shell/_dashboard": { beforeLoad: () => {} },
};
const base: RouterParameters<undefined, "/projects/$projectSlug"> = {
    route: storyRoute("/_authenticated/_shell/_dashboard/projects/$projectSlug"),
    path: "/projects/$projectSlug",
    params: { projectSlug: "brand-refresh" },
    routeOverrides: parents,
};
const meta = {
    title: "pages/Projects/Detail",
    parameters: { layout: "fullscreen", tanstack: { router: base } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Populated: Story = { parameters: { env: { world: "acmeAgency" } } };
export const Empty: Story = {
    parameters: {
        env: { world: "acmeAgency", handlers: { "timeEntries.listForProject": () => [] } },
    },
};
export const Loading: Story = {
    parameters: {
        env: { world: "acmeAgency" },
        tanstack: {
            router: {
                ...base,
                routeOverrides: {
                    ...parents,
                    "/_authenticated/_shell/_dashboard/projects/$projectSlug": {
                        loader: () => new Promise(() => {}),
                    },
                },
            } as RouterParameters<undefined, "/projects/$projectSlug">,
        },
    },
};
export const Error: Story = {
    parameters: {
        env: { world: "acmeAgency" },
        tanstack: {
            router: {
                ...base,
                routeOverrides: {
                    ...parents,
                    "/_authenticated/_shell/_dashboard/projects/$projectSlug": {
                        loader: () => {
                            throw new globalThis.Error("Project unavailable");
                        },
                    },
                },
            } as RouterParameters<undefined, "/projects/$projectSlug">,
        },
    },
};
