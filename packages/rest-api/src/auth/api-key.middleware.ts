import type { ApiScope } from "@repo/backend";
import type { MiddlewareHandler } from "hono";
import { errorBody } from "../http/error-response.ts";
import type { ApiKeyVerifier, ApiPrincipal } from "./api-key-verifier.ts";

export const API_KEY_HEADER = "x-api-key";
export interface ApiEnv {
    Variables: { apiPrincipal: ApiPrincipal };
}

export function apiKeyAuth(verifier: ApiKeyVerifier): MiddlewareHandler<ApiEnv> {
    return async (context, next) => {
        const rawKey = context.req.header(API_KEY_HEADER);
        if (!rawKey) return context.json(errorBody("unauthorized", "Missing API key."), 401);
        const principal = await verifier.verify(rawKey);
        if (!principal) {
            return context.json(errorBody("unauthorized", "Invalid or expired API key."), 401);
        }
        context.set("apiPrincipal", principal);
        await next();
    };
}

export function requireScope(scope: ApiScope): MiddlewareHandler<ApiEnv> {
    return async (context, next) => {
        if (!context.get("apiPrincipal").scopes.has(scope)) {
            return context.json(errorBody("forbidden", `Missing required scope: ${scope}`), 403);
        }
        await next();
    };
}
