import { httpBatchLink } from "@trpc/client";
import type { UserAppRouter } from "@repo/backend";
import { USER_TRPC_PATH } from "@repo/protocol";
import superjson from "superjson";
import { BackendClient } from "./backend.client.ts";

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
