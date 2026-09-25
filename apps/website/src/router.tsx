import type { ReactNode } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import type { TRPCClient } from "@trpc/client";
import type { UserAppRouter } from "@repo/client";
import type { TRPCProxy } from "@/lib/trpc";
import { routeTree } from "@/routeTree.gen";

export interface RouterContext {
    queryClient: QueryClient;
    trpcClient: TRPCClient<UserAppRouter>;
    trpc: TRPCProxy;
}

export function createAppRouter(context: RouterContext) {
    return createRouter({
        routeTree,
        defaultPreload: "intent",
        // Query owns caching, so a hover preload must not skip the loader for the router's default 30 seconds.
        defaultPreloadStaleTime: 0,
        context,
    });
}

export type AppRouter = ReturnType<typeof createAppRouter>;

declare module "@tanstack/react-router" {
    interface Register {
        router: AppRouter;
    }
    interface StaticDataRouteOption {
        Sidebar?: () => ReactNode;
        fullViewport?: boolean;
    }
}
