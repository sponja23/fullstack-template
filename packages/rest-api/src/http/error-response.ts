import { z } from "@hono/zod-openapi";

export const errorResponseSchema = z
    .object({ error: z.object({ code: z.string(), message: z.string() }) })
    .openapi("ErrorResponse");
export type ErrorResponseBody = z.infer<typeof errorResponseSchema>;

export function errorBody(code: string, message: string): ErrorResponseBody {
    return { error: { code, message } };
}
