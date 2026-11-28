import { z } from "zod";
import { nameSchema } from "./fields.ts";

export const API_SCOPES = ["clients:read", "invoices:read", "invoices:write"] as const;
export const apiScopeSchema = z.enum(API_SCOPES);
export type ApiScope = z.infer<typeof apiScopeSchema>;

export const apiKeyScopesSchema = z.array(apiScopeSchema).nonempty();

export const issueApiKeyInputSchema = z.object({
    name: nameSchema,
    scopes: apiKeyScopesSchema,
    expiresInSeconds: z.number().int().positive().optional(),
});

export const revokeApiKeyInputSchema = z.object({ keyId: z.string() });
