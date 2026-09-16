import { z } from "zod";
import type { Auth } from "../../auth/factory.ts";
import { ForbiddenError } from "../../errors/base.ts";
import { type UserRouterBuilder, type UserRouterContext } from "../../trpc/user.procedures.ts";
import { apiScopeSchema, scopesFromMetadata } from "./api-key.scopes.ts";

export type ApiKeyUserRouterDeps = UserRouterContext;

async function requireOwner(auth: Auth, headers: Headers, organizationId: string) {
    const { role } = await auth.api.getActiveMemberRole({
        headers,
        query: { organizationId },
    });
    if (!role.split(",").some((value) => value.trim() === "owner")) {
        throw new ForbiddenError("Only organization owners can manage API keys");
    }
}

/** Manages API keys for the caller's active organization through better-auth. */
export const apiKeyUserRouter = ((deps: ApiKeyUserRouterDeps) => {
    const { router, orgProcedure } = deps;
    return router({
        issue: orgProcedure
            .input(
                z.object({
                    name: z.string().min(1).max(100),
                    scopes: z.array(apiScopeSchema).nonempty(),
                    expiresInSeconds: z.number().int().positive().optional(),
                }),
            )
            .mutation(async ({ ctx: { auth, headers, session }, input }) => {
                await requireOwner(auth, headers, session.organizationId);
                const created = await auth.api.createApiKey({
                    body: {
                        organizationId: session.organizationId,
                        name: input.name,
                        metadata: { scopes: input.scopes },
                        ...(input.expiresInSeconds !== undefined
                            ? { expiresIn: input.expiresInSeconds }
                            : {}),
                    },
                    headers,
                });
                return { id: created.id, name: input.name, scopes: input.scopes, key: created.key };
            }),
        list: orgProcedure.query(async ({ ctx: { auth, headers, session } }) => {
            await requireOwner(auth, headers, session.organizationId);
            const { apiKeys } = await auth.api.listApiKeys({
                query: { organizationId: session.organizationId },
                headers,
            });
            return {
                apiKeys: apiKeys.map((key) => ({
                    id: key.id,
                    name: key.name,
                    start: key.start,
                    scopes: scopesFromMetadata(key.metadata),
                    createdAt: key.createdAt,
                    lastRequest: key.lastRequest,
                })),
            };
        }),
        revoke: orgProcedure
            .input(z.object({ keyId: z.string() }))
            .mutation(async ({ ctx: { auth, headers, session }, input }) => {
                await requireOwner(auth, headers, session.organizationId);
                await auth.api.deleteApiKey({ body: { keyId: input.keyId }, headers });
                return { success: true };
            }),
    });
}) satisfies UserRouterBuilder<ApiKeyUserRouterDeps>;
