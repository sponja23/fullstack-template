# @repo/storybook

This `tools/` dependency sink renders `@repo/ui` primitives and website routes
without a development server or backend. Load the `storybook` skill when changing
stories, worlds, or the catalog harness.

`src/fake-trpc.ts` terminates a real `TRPCClient<UserAppRouter>` with fixture
handlers. `src/fake-auth.ts` pins the mirrored auth-session query in React Query so
it cannot refetch through the real auth client. `src/story-env.tsx` combines those
fixtures per story; once the website package exists it should reuse the website's
own tRPC context so product hooks and the fake client share one provider.

The preview follows `prefers-color-scheme` and listens for OS changes. Keep the
jsdom smoke for fast feedback and the Chromium smoke for portal, layout, and route
runtime coverage.
