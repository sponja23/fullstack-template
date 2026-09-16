import { Suspense, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { z } from "zod";
import type { Decorator } from "@storybook/tanstack-react";
import { createTRPCProxy, TRPCProvider } from "@repo/website/lib/trpc";
import { seedSession, type FakeSession } from "./fake-auth";
import { createFakeUserClient, type FakeTRPCHandler, type FakeTRPCHandlers } from "./fake-trpc";
import { worlds, type SeededQuery, type WorldName } from "./worlds";

const storyEnvSchema = z.object({
    world: z.enum(Object.keys(worlds) as [WorldName, ...WorldName[]]).optional(),
    session: z.custom<FakeSession | null>().optional(),
    handlers: z
        .record(
            z.string(),
            z.custom<FakeTRPCHandler>((value) => typeof value === "function"),
        )
        .optional(),
    queries: z.custom<readonly SeededQuery[]>((value) => Array.isArray(value)).optional(),
});

type StoryEnv = z.infer<typeof storyEnvSchema>;

function buildStoryContext(env: StoryEnv) {
    const world = env.world ? worlds[env.world] : worlds.acmeAgency;
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    seedSession(queryClient, env.session !== undefined ? env.session : world.session);
    for (const { queryKey, data } of [...(world.queries ?? []), ...(env.queries ?? [])]) {
        queryClient.setQueryDefaults([...queryKey], { staleTime: Infinity, gcTime: Infinity });
        queryClient.setQueryData([...queryKey], data);
    }
    const handlers: FakeTRPCHandlers = { ...world.handlers, ...env.handlers };
    const trpcClient = createFakeUserClient(handlers);
    return { queryClient, trpcClient, trpc: createTRPCProxy(trpcClient, queryClient) };
}

type BuiltStoryContext = ReturnType<typeof buildStoryContext>;
const storyContexts = new Map<string, BuiltStoryContext>();

export function createStoryRouterContext({
    storyContext,
}: {
    storyContext: Parameters<Decorator>[1];
}) {
    const env = storyEnvSchema.parse(storyContext.parameters.env ?? {});
    const built = buildStoryContext(env);
    storyContexts.set(storyContext.id, built);
    return built;
}

function EnvProvider({ context, children }: { context: BuiltStoryContext; children: ReactNode }) {
    const { queryClient, trpcClient } = context;

    return (
        <QueryClientProvider client={queryClient}>
            <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
                <Suspense
                    fallback={<div className="p-6 text-sm text-muted-foreground">Loading…</div>}
                >
                    {children}
                </Suspense>
            </TRPCProvider>
        </QueryClientProvider>
    );
}

export const withStoryEnv: Decorator = (Story, context) => {
    const built =
        storyContexts.get(context.id) ??
        buildStoryContext(storyEnvSchema.parse(context.parameters.env ?? {}));
    return (
        <EnvProvider context={built}>
            <Story />
        </EnvProvider>
    );
};
