import { API_SCOPES, type ApiScope } from "@repo/protocol";

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
