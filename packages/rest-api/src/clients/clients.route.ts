import { z } from "@hono/zod-openapi";
import type { RouteRegistrar } from "../http/authenticated-route.ts";
import type { ClientRecord, ClientsPort } from "./clients.port.ts";

const ClientResource = z
    .object({
        id: z.string().uuid(),
        name: z.string(),
        billingEmail: z.string().email(),
        currency: z.enum(["USD", "EUR"]),
        status: z.enum(["active", "archived"]),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
    })
    .openapi("Client");

function resource(client: ClientRecord): z.infer<typeof ClientResource> {
    return {
        ...client,
        createdAt: client.createdAt.toISOString(),
        updatedAt: client.updatedAt.toISOString(),
    };
}

export function registerClientRoutes(register: RouteRegistrar, clients: ClientsPort): void {
    register({
        method: "get",
        path: "/clients",
        scope: "clients:read",
        summary: "List clients",
        tags: ["Clients"],
        responses: {
            200: {
                description: "The organization's clients.",
                schema: z.object({ clients: z.array(ClientResource) }),
            },
        },
        handler: async ({ principal, reply }) =>
            reply(200, { clients: (await clients.list(principal.organizationId)).map(resource) }),
    });
    register({
        method: "get",
        path: "/clients/{id}",
        scope: "clients:read",
        summary: "Get a client",
        tags: ["Clients"],
        request: { params: z.object({ id: z.string().uuid() }) },
        responses: { 200: { description: "The client.", schema: ClientResource } },
        errors: { 404: "Client not found." },
        handler: async ({ principal, params, reply }) =>
            reply(200, resource(await clients.get(principal.organizationId, params.id))),
    });
}
