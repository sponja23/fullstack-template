# Navigation shell and active-organization reconciliation

`route.tsx` is the persistent frame: a collapsible sidebar whose content is contributed by the deepest matched route through `staticData.Sidebar`, with the avatar menu pinned in the footer. The nearest ancestor contribution remains active when a leaf declares none.

A route declaring `staticData.fullViewport` opts out of the frame while retaining the session and active-organization guarantees. The invoice print route is the intended consumer.

## Active organization

The dashboard boundary reconciles an active organization in this order:

1. Keep the session's active organization.
2. Use `lastActiveOrganizationId` when the user is still a member.
3. Use the deterministic membership floor: oldest `createdAt`, with `id` as the tie-breaker.
4. Redirect a user with no memberships to onboarding.

## Navigation and invalidation

When switching organization or signing out, navigate away from the scoped route before clearing or invalidating caches. Otherwise mounted loaders can refetch with the new or missing identity and flash errors.

Sidebar highlights use `useRouteActive`, with options identical to their `Link`.
