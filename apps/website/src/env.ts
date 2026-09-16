import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
    clientPrefix: "VITE_",
    client: {
        VITE_API_URL: z.url().refine((url) => !url.endsWith("/"), {
            message: "must not end with a trailing slash",
        }),
    },
    runtimeEnv: import.meta.env,
    emptyStringAsUndefined: true,
    skipValidation: import.meta.env.SKIP_ENV_VALIDATION === "true",
});
