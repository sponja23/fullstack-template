import { z } from "zod";

export const API_SCOPES = ["clients:read", "invoices:read", "invoices:write"] as const;
export const apiScopeSchema = z.enum(API_SCOPES);
export type ApiScope = z.infer<typeof apiScopeSchema>;

export const API_KEY_NAME_MAX_LENGTH = 100;

export const apiKeyNameSchema = z.string().min(1).max(API_KEY_NAME_MAX_LENGTH);
export const apiKeyScopesSchema = z.array(apiScopeSchema).nonempty();

export const issueApiKeyInputSchema = z.object({
    name: apiKeyNameSchema,
    scopes: apiKeyScopesSchema,
    expiresInSeconds: z.number().int().positive().optional(),
});

export const revokeApiKeyInputSchema = z.object({ keyId: z.string() });
