import { z } from "zod";

export const API_SCOPES = ["clients:read", "invoices:read", "invoices:write"] as const;
export type ApiScope = (typeof API_SCOPES)[number];
export const apiScopeSchema = z.enum(API_SCOPES);

export interface ApiKeyMetadata {
    scopes: ApiScope[];
}

export function scopesFromMetadata(metadata: unknown): ApiScope[] {
    if (metadata === null || typeof metadata !== "object" || !("scopes" in metadata)) return [];
    const scopes = (metadata as { scopes: unknown }).scopes;
    if (!Array.isArray(scopes)) return [];
    const known = new Set<string>(API_SCOPES);
    return scopes.filter(
        (scope): scope is ApiScope => typeof scope === "string" && known.has(scope),
    );
}
