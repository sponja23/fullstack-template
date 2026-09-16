# Website App — React 19 + Vite Conventions

## Stack

- Vite with React 19 and strict TypeScript.
- TanStack Router for file-based routing.
- TanStack Query and tRPC for typed data fetching.
- TanStack Form through the local `useAppForm` and `useMutationForm` bindings.
- Zod schemas for form and boundary validation.
- React Compiler. Do not add explicit `useCallback` or `useMemo` without a demonstrated need.

## React principles

Use effects only for real effects such as DOM synchronization and subscriptions. Compute derived state while rendering and fetch remote state through TanStack Query.

Keep state near its consumer, split large components by responsibility, and use context only when data would otherwise cross multiple intermediate layers.

Do not derive navigation state from `useMatchRoute()`: its stable function identity can freeze compiler-memoized results. Use `useRouteActive` and give it the same options as the rendered `Link`.

## Module resolution

Relative and alias imports omit file extensions in this Vite app: `from "@/lib/form"`.

## Stories

Every rendered route has a colocated `<name>.stories.tsx`. Change the route and its story together. Route stories mount the real route tree and cover populated, empty, loading, and error states when the route owns those states.

## API, forms, and auth

Read `src/lib/queries/AGENTS.md` before changing query hooks or calling a procedure. Read `src/components/form/AGENTS.md` before changing forms, field components, or error mappings.

Better Auth owns identity, organizations, members, invitations, and the app-level superadmin role. `unwrapAuthResult` turns action failures into `BetterAuthActionError` with a machine-readable code. That code and tRPC's `data.errorCode` both enter a form's typed `FormErrorConfig`; backend error messages are never rendered.

Role strings may be comma-separated, so decode them through `lib/role.ts` rather than comparing strings directly. Role checks in the website only control presentation; the backend remains authoritative.

`useAuth` is safe above the authenticated boundary. `useUser` requires a session and belongs only below it.
