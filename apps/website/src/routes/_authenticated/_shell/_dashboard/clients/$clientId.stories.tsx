import type { Meta, RouterParameters, StoryObj } from "@storybook/tanstack-react";
import { storyRoute } from "@/routes/-story-route";

const clientId = "10000000-0000-4000-8000-000000000001";
const parents = {
    "/_authenticated": { beforeLoad: () => {} },
    "/_authenticated/_shell/_dashboard": { beforeLoad: () => {} },
};
const base: RouterParameters<undefined, "/clients/$clientId"> = {
    route: storyRoute("/_authenticated/_shell/_dashboard/clients/$clientId"),
    path: "/clients/$clientId",
    params: { clientId },
    routeOverrides: parents,
};
const meta = {
    title: "pages/Clients/Detail",
    parameters: { layout: "fullscreen", tanstack: { router: base } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Populated: Story = { parameters: { env: { world: "acmeAgency" } } };
export const Empty: Story = {
    parameters: {
        env: { world: "acmeAgency", handlers: { "projects.list": () => [] } },
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
                    "/_authenticated/_shell/_dashboard/clients/$clientId": {
                        loader: () => new Promise(() => {}),
                    },
                },
            } as RouterParameters<undefined, "/clients/$clientId">,
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
                    "/_authenticated/_shell/_dashboard/clients/$clientId": {
                        loader: () => {
                            throw new globalThis.Error("Client unavailable");
                        },
                    },
                },
            } as RouterParameters<undefined, "/clients/$clientId">,
        },
    },
};
