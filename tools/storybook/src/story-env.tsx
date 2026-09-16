import { Suspense, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { z } from "zod";
import type { Decorator } from "@storybook/tanstack-react";
import { TRPCProvider } from "@repo/website/lib/trpc";
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

function EnvProvider({ env, children }: { env: StoryEnv; children: ReactNode }) {
    const world = env.world ? worlds[env.world] : worlds.acmeAgency;
    const [queryClient] = useState(() => {
        const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
        seedSession(client, env.session !== undefined ? env.session : world.session);
        for (const { queryKey, data } of [...(world.queries ?? []), ...(env.queries ?? [])]) {
            client.setQueryDefaults([...queryKey], { staleTime: Infinity, gcTime: Infinity });
            client.setQueryData([...queryKey], data);
        }
        return client;
    });
    const [trpcClient] = useState(() => {
        const handlers: FakeTRPCHandlers = { ...world.handlers, ...env.handlers };
        return createFakeUserClient(handlers);
    });

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

export const withStoryEnv: Decorator = (Story, context) => (
    <EnvProvider env={storyEnvSchema.parse(context.parameters.env ?? {})}>
        <Story />
    </EnvProvider>
);
