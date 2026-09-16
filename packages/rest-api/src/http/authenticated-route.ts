import { BadRequestError, type ApiScope } from "@repo/backend";
import { type OpenAPIHono, type RouteConfig, createRoute, z } from "@hono/zod-openapi";
import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { type ApiEnv, apiKeyAuth, requireScope } from "../auth/api-key.middleware.ts";
import type { ApiKeyVerifier, ApiPrincipal } from "../auth/api-key-verifier.ts";
import { ErrorResponse } from "./error-response.ts";

interface SuccessSpec {
    description: string;
    schema: z.ZodType;
}
type InferOr<T> = T extends z.ZodType ? z.infer<T> : undefined;
type Reply<R extends Record<number, SuccessSpec>> = {
    [S in keyof R]: R[S] extends SuccessSpec ? { status: S; body: z.infer<R[S]["schema"]> } : never;
}[keyof R];

export interface RouteSpec<
    Params extends z.ZodType | undefined,
    Body extends z.ZodType | undefined,
    Query extends z.ZodType | undefined,
    Responses extends Record<number, SuccessSpec>,
> {
    method: RouteConfig["method"];
    path: string;
    scope?: ApiScope;
    summary: string;
    description?: string;
    tags: [string, ...string[]];
    request?: { params?: Params; body?: Body; query?: Query; bodyRequired?: boolean };
    responses: Responses;
    errors?: Record<number, string>;
    handler: (context: {
        principal: ApiPrincipal;
        params: InferOr<Params>;
        body: InferOr<Body>;
        query: InferOr<Query>;
        reply: <S extends keyof Responses>(
            status: S,
            body: Responses[S] extends SuccessSpec ? z.infer<Responses[S]["schema"]> : never,
        ) => Reply<Responses>;
    }) => Promise<Reply<Responses>>;
}

const jsonError = (description: string) => ({
    description,
    content: { "application/json": { schema: ErrorResponse } },
});

export function createRouteRegistrar(app: OpenAPIHono<ApiEnv>, verifier: ApiKeyVerifier) {
    return function registerRoute<
        Params extends z.ZodType | undefined = undefined,
        Body extends z.ZodType | undefined = undefined,
        Query extends z.ZodType | undefined = undefined,
        Responses extends Record<number, SuccessSpec> = Record<number, SuccessSpec>,
    >(spec: RouteSpec<Params, Body, Query, Responses>): void {
        const responses: Record<number, unknown> = {};
        for (const [status, success] of Object.entries(spec.responses)) {
            responses[Number(status)] = {
                description: success.description,
                content: { "application/json": { schema: success.schema } },
            };
        }
        responses[401] = jsonError("Missing or invalid API key.");
        if (spec.scope) responses[403] = jsonError(`Missing the ${spec.scope} scope.`);
        if (spec.request) responses[400] = jsonError("Invalid request.");
        for (const [status, description] of Object.entries(spec.errors ?? {})) {
            responses[Number(status)] = jsonError(description);
        }
        const request: Record<string, unknown> = {};
        if (spec.request?.params) request.params = spec.request.params;
        if (spec.request?.query) request.query = spec.request.query;
        const bodyRequired = spec.request?.bodyRequired ?? true;
        if (spec.request?.body) {
            request.body = {
                required: bodyRequired,
                content: { "application/json": { schema: spec.request.body } },
            };
        }
        const route = createRoute({
            method: spec.method,
            path: spec.path,
            summary: spec.summary,
            description: spec.description,
            tags: spec.tags,
            security: [{ ApiKey: [] }],
            middleware: spec.scope
                ? [apiKeyAuth(verifier), requireScope(spec.scope)]
                : [apiKeyAuth(verifier)],
            request: request as never,
            responses: responses as never,
        });
        app.openapi(route, (async (context: Context<ApiEnv>) => {
            const result = await spec.handler({
                principal: context.get("apiPrincipal"),
                params: spec.request?.params ? context.req.valid("param" as never) : undefined,
                query: spec.request?.query ? context.req.valid("query" as never) : undefined,
                body: !spec.request?.body
                    ? undefined
                    : bodyRequired
                      ? context.req.valid("json" as never)
                      : await validateOptionalBody(context, spec.request.body),
                reply: (status: PropertyKey, body: unknown) => ({ status, body }) as never,
            } as never);
            return context.json(result.body, result.status as ContentfulStatusCode);
        }) as never);
    };
}

export type RouteRegistrar = ReturnType<typeof createRouteRegistrar>;

async function validateOptionalBody(context: Context, schema: z.ZodType): Promise<unknown> {
    const text = context.req.header("content-type")?.includes("application/json")
        ? await context.req.text()
        : "";
    let raw: unknown = {};
    if (text.trim() !== "") {
        try {
            raw = JSON.parse(text);
        } catch {
            throw new BadRequestError("The request body is not valid JSON.");
        }
    }
    const parsed = schema.safeParse(raw);
    if (!parsed.success) throw new BadRequestError(z.prettifyError(parsed.error));
    return parsed.data;
}
