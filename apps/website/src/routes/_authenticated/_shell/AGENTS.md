# Navigation shell & active-org reconciliation

`route.tsx` is the persistent frame: a collapsible sidebar whose content is contributed by the deepest matched route through `staticData.Sidebar`, with the avatar menu pinned in the footer. Only the avatar is fixed; the section above it swaps as the user navigates, falling back to the nearest ancestor's section when a leaf declares none through `matches.findLast((match) => match.staticData.Sidebar)`.

A route declaring `staticData.fullViewport` opts out of the frame entirely while retaining the session and active-organization guarantees. The invoice print route is the intended consumer.

## Active-org reconciliation

The dashboard boundary reconciles an active organization in this order:

1. Keep the session's active organization.
2. Use `lastActiveOrganizationId` when the user is still a member.
3. Use the deterministic membership floor: oldest `createdAt`, with `id` as the tie-breaker.
4. Redirect a user with no memberships to onboarding.

The deterministic floor keeps the fallback stable across loads; without it, two visits could land on different organizations.

## Navigate before you invalidate

When switching organization or signing out, navigate away from the organization-scoped route before clearing or invalidating caches. Invalidating in place can rerun mounted loaders against the new or missing identity and flash errors. Navigate to `/login` before sign-out cache clearing so authenticated components are gone before their session disappears.

## Route active-state

Sidebar highlights use `useRouteActive`, never `useMatchRoute`; the React Compiler reason lives in the website `AGENTS.md`. Pass options identical to the rendered `Link` so navigation and highlighting cannot disagree.

Keep a link's route options in one value shared by `useRouteActive` and the rendered `Link`; two separately authored option objects can drift even when they initially match.
