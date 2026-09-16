import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
    server: {
        NODE_ENV: z.enum(["development", "production", "test"]).optional().default("development"),
        PORT: z.coerce.number().int().positive().optional().default(3000),
        DATABASE_URL: z.url(),
        BETTER_AUTH_SECRET: z.string().min(1),
        WEB_URL: z.url(),
        AUTH_TRUSTED_HOSTS: z
            .string()
            .optional()
            .default("localhost:3000")
            .transform((value) =>
                value
                    .split(",")
                    .map((host) => host.trim())
                    .filter(Boolean),
            ),
        AUTH_COOKIE_DOMAIN: z.string().optional(),
    },
    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
});
