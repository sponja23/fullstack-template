import { z } from "@hono/zod-openapi";

export const errorResponseSchema = z
    .object({ error: z.object({ code: z.string(), message: z.string() }) })
    .openapi("ErrorResponse");
export type ErrorResponse = z.infer<typeof errorResponseSchema>;

export function errorBody(code: string, message: string): ErrorResponse {
    return { error: { code, message } };
}
