import type { Meta, RouterParameters, StoryObj } from "@storybook/tanstack-react";
import { storyRoute } from "@/routes/-story-route";

const id = "50000000-0000-4000-8000-000000000002";
const parents = {
    "/_authenticated": { beforeLoad: () => {} },
    "/_authenticated/_shell/_dashboard": { beforeLoad: () => {} },
};
const base: RouterParameters<undefined, "/invoices/$invoiceId/print"> = {
    route: storyRoute("/_authenticated/_shell/_dashboard/invoices/$invoiceId/print"),
    path: "/invoices/$invoiceId/print",
    params: { invoiceId: id },
    routeOverrides: parents,
};
const meta = {
    title: "pages/Invoices/Print",
    parameters: { layout: "fullscreen", tanstack: { router: base } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Populated: Story = { parameters: { env: { world: "acmeAgency" } } };
export const Empty: Story = {
    parameters: {
        env: {
            world: "emptyOrg",
            handlers: {
                "invoices.get": () => ({
                    id,
                    organizationId: "org_acme",
                    clientId: "10000000-0000-4000-8000-000000000001",
                    clientName: "Globex",
                    billingEmail: "billing@globex.test",
                    currency: "USD",
                    number: 1,
                    status: "issued",
                    issuedAt: new Date("2026-01-01"),
                    paidAt: null,
                    voidedAt: null,
                    createdAt: new Date("2026-01-01"),
                    updatedAt: new Date("2026-01-01"),
                    lineItems: [],
                }),
            },
        },
    },
};
export const Loading: Story = {
    parameters: {
        env: { world: "emptyOrg" },
        tanstack: {
            router: {
                ...base,
                routeOverrides: {
                    ...parents,
                    "/_authenticated/_shell/_dashboard/invoices/$invoiceId/print": {
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
                    "/_authenticated/_shell/_dashboard/invoices/$invoiceId/print": {
                        loader: () => {
                            throw new globalThis.Error("Invoice unavailable");
                        },
                    },
                },
            } as typeof base,
        },
    },
};
