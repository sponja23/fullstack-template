import { z } from "@hono/zod-openapi";

export const ErrorResponse = z
    .object({ error: z.object({ code: z.string(), message: z.string() }) })
    .openapi("ErrorResponse");
export type ErrorResponseBody = z.infer<typeof ErrorResponse>;

export function errorBody(code: string, message: string): ErrorResponseBody {
    return { error: { code, message } };
}
