import { createAuthClient } from "better-auth/react";
import { adminClient, organizationClient } from "better-auth/client/plugins";
import { env } from "@/env";

export const authClient = createAuthClient({
    baseURL: env.VITE_API_URL,
    basePath: "/auth",
    plugins: [organizationClient(), adminClient()],
});
