# @repo/storybook

A `tools/` catalog that renders `@repo/ui` primitives and website routes with no development server or backend. Authoring stories is covered by the `storybook` skill; this note holds the harness rationale a change must not lose.

## Faking the website's data layer

`createFakeUserClient` in `src/fake-trpc.ts` builds a real `TRPCClient<UserAppRouter>` whose only fake is its terminating link: it resolves each operation from a handlers map instead of dialing the backend. The proxy, query and mutation dispatch, and error wrapping remain genuine, so website hooks behave as they do against the live API. `src/story-env.tsx` mounts it through the website's own `TRPCProvider`, so product `useTRPC()` hooks read the fake client.

`src/fake-auth.ts` seeds session data into the Query cache rather than importing the real auth client, which would load validated environment configuration. Keep the hand-mirrored `SESSION_QUERY_KEY` and the `staleTime`/`gcTime: Infinity` pin in `seedSession`; the inline comments at those sites document the invariants.

The preview follows `prefers-color-scheme` and listens for operating-system changes. Keep the jsdom smoke for fast feedback and Chromium for portal, layout, and route runtime coverage.
