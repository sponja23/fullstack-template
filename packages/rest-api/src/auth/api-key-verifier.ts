import type { ApiScope } from "@repo/backend";

export interface ApiPrincipal {
    organizationId: string;
    scopes: ReadonlySet<ApiScope>;
}

export interface ApiKeyVerifier {
    verify(rawKey: string): Promise<ApiPrincipal | null>;
}
