import type { Meta, RouterParameters, StoryObj } from "@storybook/tanstack-react";
import { storyRoute } from "@/routes/-story-route";

const id = "50000000-0000-4000-8000-000000000002";
const parents = {
    "/_authenticated": { beforeLoad: () => {} },
    "/_authenticated/_shell/_dashboard": { beforeLoad: () => {} },
};
const base: RouterParameters<undefined, "/invoices/$invoiceId"> = {
    route: storyRoute("/_authenticated/_shell/_dashboard/invoices/$invoiceId"),
    path: "/invoices/$invoiceId",
    params: { invoiceId: id },
    routeOverrides: parents,
};
const meta = {
    title: "pages/Invoices/Detail",
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
                    number: null,
                    status: "draft",
                    issuedAt: null,
                    paidAt: null,
                    voidedAt: null,
                    createdAt: new Date("2026-01-01"),
                    updatedAt: new Date("2026-01-01"),
                    lineItems: [],
                }),
                "invoices.listUnbilledEntries": () => [],
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
                    "/_authenticated/_shell/_dashboard/invoices/$invoiceId": {
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
                    "/_authenticated/_shell/_dashboard/invoices/$invoiceId": {
                        loader: () => {
                            throw new globalThis.Error("Invoice unavailable");
                        },
                    },
                },
            } as typeof base,
        },
    },
};
