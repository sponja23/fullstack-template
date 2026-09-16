import type { QueryClient } from "@tanstack/react-query";
import type { TRPCClient } from "@trpc/client";
import { createTRPCContext, createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { UserAppRouter } from "@repo/client";

export const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<UserAppRouter>();

export function createTRPCProxy(client: TRPCClient<UserAppRouter>, queryClient: QueryClient) {
    return createTRPCOptionsProxy<UserAppRouter>({ client, queryClient });
}

export type TRPCProxy = ReturnType<typeof createTRPCProxy>;
