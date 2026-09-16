import { z } from "@hono/zod-openapi";
import type { RouteRegistrar } from "../http/authenticated-route.ts";
import type { InvoiceRecord, InvoicesPort } from "./invoices.port.ts";

const statuses = ["draft", "issued", "paid", "void"] as const;
const LineItemResource = z.object({
    id: z.string().uuid(),
    kind: z.enum(["generated", "manual"]),
    description: z.string(),
    quantity: z.number().int(),
    unitAmountMinor: z.number().int(),
    totalMinor: z.number().int(),
});
const InvoiceResource = z
    .object({
        id: z.string().uuid(),
        clientId: z.string().uuid(),
        clientName: z.string(),
        billingEmail: z.string().email(),
        currency: z.enum(["USD", "EUR"]),
        number: z.number().int().nullable(),
        status: z.enum(statuses),
        issuedAt: z.string().datetime().nullable(),
        paidAt: z.string().datetime().nullable(),
        voidedAt: z.string().datetime().nullable(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
        totalMinor: z.number().int(),
        lineItems: z.array(LineItemResource),
    })
    .openapi("Invoice");
const InvoiceSummary = InvoiceResource.omit({ lineItems: true }).openapi("InvoiceSummary");

function resource(invoice: InvoiceRecord): z.infer<typeof InvoiceResource> {
    return {
        ...invoice,
        issuedAt: invoice.issuedAt?.toISOString() ?? null,
        paidAt: invoice.paidAt?.toISOString() ?? null,
        voidedAt: invoice.voidedAt?.toISOString() ?? null,
        createdAt: invoice.createdAt.toISOString(),
        updatedAt: invoice.updatedAt.toISOString(),
        totalMinor: invoice.lineItems.reduce((total, line) => total + line.totalMinor, 0),
        lineItems: invoice.lineItems.map((line) => ({
            id: line.id,
            kind: line.kind,
            description: line.description,
            quantity: line.quantity,
            unitAmountMinor: line.unitAmountMinor,
            totalMinor: line.totalMinor,
        })),
    };
}

export function registerInvoiceRoutes(register: RouteRegistrar, invoices: InvoicesPort): void {
    register({
        method: "get",
        path: "/invoices",
        scope: "invoices:read",
        summary: "List invoices",
        tags: ["Invoices"],
        request: { query: z.object({ status: z.enum(statuses).optional() }) },
        responses: {
            200: {
                description: "The organization's invoices.",
                schema: z.object({ invoices: z.array(InvoiceSummary) }),
            },
        },
        handler: async ({ principal, query, reply }) => {
            const records = await invoices.list(principal.organizationId, query.status);
            return reply(200, {
                invoices: records.map((invoice) => ({
                    ...invoice,
                    issuedAt: invoice.issuedAt?.toISOString() ?? null,
                    paidAt: invoice.paidAt?.toISOString() ?? null,
                    voidedAt: invoice.voidedAt?.toISOString() ?? null,
                    createdAt: invoice.createdAt.toISOString(),
                    updatedAt: invoice.updatedAt.toISOString(),
                })),
            });
        },
    });
    register({
        method: "get",
        path: "/invoices/{number}",
        scope: "invoices:read",
        summary: "Get an invoice",
        tags: ["Invoices"],
        request: { params: z.object({ number: z.coerce.number().int().positive() }) },
        responses: { 200: { description: "The invoice.", schema: InvoiceResource } },
        errors: { 404: "Invoice not found." },
        handler: async ({ principal, params, reply }) =>
            reply(
                200,
                resource(await invoices.getByNumber(principal.organizationId, params.number)),
            ),
    });
    register({
        method: "post",
        path: "/invoices/{number}/mark-paid",
        scope: "invoices:write",
        summary: "Mark an invoice paid",
        tags: ["Invoices"],
        request: { params: z.object({ number: z.coerce.number().int().positive() }) },
        responses: { 200: { description: "The paid invoice.", schema: InvoiceResource } },
        errors: { 404: "Invoice not found.", 409: "The invoice cannot be marked paid." },
        handler: async ({ principal, params, reply }) =>
            reply(
                200,
                resource(await invoices.markPaidByNumber(principal.organizationId, params.number)),
            ),
    });
}
