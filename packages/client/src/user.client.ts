import { httpBatchLink } from "@trpc/client";
import type { UserAppRouter } from "@repo/backend";
import superjson from "superjson";
import { BackendClient } from "./backend.client.ts";
import { USER_TRPC_PATH } from "./paths.ts";

export interface UserClientOptions {
    apiBaseUrl: string;
}

/** Cookie-authenticated wire client for the browser user principal. */
export class UserClient extends BackendClient<UserAppRouter> {
    constructor(opts: UserClientOptions) {
        super({
            transportLink: httpBatchLink({
                url: `${opts.apiBaseUrl}${USER_TRPC_PATH}`,
                transformer: superjson,
                fetch: (input, init) => fetch(input, { ...init, credentials: "include" }),
            }),
        });
    }
}
