import type { ApiScope } from "@repo/backend";
import type { ApiKeyVerifier } from "../auth/api-key-verifier.ts";

export function fakeVerifier(
    keys: Record<string, { organizationId: string; scopes: ApiScope[] }>,
): ApiKeyVerifier {
    return {
        verify: async (key) => {
            const principal = keys[key];
            return principal
                ? { organizationId: principal.organizationId, scopes: new Set(principal.scopes) }
                : null;
        },
    };
}
