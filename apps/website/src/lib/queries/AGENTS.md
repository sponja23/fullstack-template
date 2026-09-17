# Query and mutation layer

Components never call `trpc.*` directly. Every remote interaction is exposed from a domain `*.queries.ts` module.

## Reads

A loader-backed read is a triad: one private query-options builder, one reactive hook, and one loader-side `ensure*Data` helper warming the same cache. The `ensure*Data` member exists only for reads a route loader actually prefetches; a live-only read that no `beforeLoad` or `loader` warms omits it rather than shipping an ensure with no caller. Prefer `useSuspenseQuery` for page data and prefetch it through `ensureAPIQueryData`; that helper maps tRPC 404 responses to the router's not-found boundary.

Organization-scoped cache keys include `organizationId`. Active organization state comes from the session rather than a second local copy. Reads without an active organization are disabled and resolve to `null`.

`setActiveOrganization` writes the local reconciliation hint, then invalidates session and organization queries. The member roster pages through Better Auth's row cap until `total` is reached and stops if a page makes no progress.

## Mutations

All tRPC and Better Auth mutations use `useAPIMutation`. It provides declarative success and error toasts, scrubs internal-looking error text, and accepts a per-call `disableErrorToast` option for forms that surface errors inline.

Mutation hooks own shared cache invalidation. UI-specific effects such as navigation and dialog closing belong to the caller's per-call callbacks. Error-toast suppression belongs at the call site, not in the hook.

`mutate` and `mutateAsync` preserve the normal TanStack Query result while adding `disableErrorToast` to their call options. The option assumes sequential calls per mutation instance, which form submission enforces.

## Identity changes

Entering an organization as its owner first impersonates the owner, then activates the organization after the new cookie has been applied. It calls Better Auth's raw `setActive` so the superadmin's reconciliation hint is not replaced. Entering, stopping, and signing out clear the entire query cache so data cannot cross identities.
