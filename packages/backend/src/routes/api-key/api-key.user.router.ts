import { z } from "zod";
import { type UserRouterBuilder, type UserRouterContext } from "../../trpc/user.procedures.ts";

export type ApiKeyUserRouterDeps = UserRouterContext;

/** Manages API keys for the caller's active organization through better-auth. */
export const apiKeyUserRouter = ((deps: ApiKeyUserRouterDeps) => {
    const { router, orgProcedure } = deps;
    return router({
        issue: orgProcedure
            .input(
                z.object({
                    name: z.string().min(1).max(100),
                    expiresInSeconds: z.number().int().positive().optional(),
                }),
            )
            .mutation(async ({ ctx: { auth, headers, session }, input }) => {
                const created = await auth.api.createApiKey({
                    body: {
                        organizationId: session.organizationId,
                        name: input.name,
                        ...(input.expiresInSeconds !== undefined
                            ? { expiresIn: input.expiresInSeconds }
                            : {}),
                    },
                    headers,
                });
                return { id: created.id, name: input.name, key: created.key };
            }),
        list: orgProcedure.query(async ({ ctx: { auth, headers, session } }) => {
            const { apiKeys } = await auth.api.listApiKeys({
                query: { organizationId: session.organizationId },
                headers,
            });
            return {
                apiKeys: apiKeys.map((key) => ({
                    id: key.id,
                    name: key.name,
                    start: key.start,
                    createdAt: key.createdAt,
                    lastRequest: key.lastRequest,
                })),
            };
        }),
        revoke: orgProcedure
            .input(z.object({ keyId: z.string() }))
            .mutation(async ({ ctx: { auth, headers }, input }) => {
                await auth.api.deleteApiKey({ body: { keyId: input.keyId }, headers });
                return { success: true };
            }),
    });
}) satisfies UserRouterBuilder<ApiKeyUserRouterDeps>;
