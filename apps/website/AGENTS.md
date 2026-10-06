# Website App — React 19 + Vite Conventions

## Stack

- Vite with React 19 and strict TypeScript.
- TanStack Router for file-based routing.
- TanStack Query and tRPC for typed data fetching.
- TanStack Form through the local `useAppForm` and `useMutationForm` bindings.
- Zod schemas for form and boundary validation.
- React Compiler. Do not add explicit `useCallback` or `useMemo` without a demonstrated need.

## TypeScript filenames

Dotted suffixes are a closed set of component and artifact roles:

- **`.queries.ts`** — a private `*QueryOptions()`, a reactive `use*`, and a loader-side `ensure*Data` as documented in `src/lib/queries/AGENTS.md`.
- **`.form.ts`** — a `use<X>Form` over `useMutationForm` paired with a `use<X>FormContext` over the same `formOptions`.
- **`.field.tsx`** — a component registered in `createFormHook`'s `fieldComponents`, reading `useFieldContext` and applying the shared touch-and-blur invalid policy.
- **Tooling artifacts** — `.stories.tsx`, `.test.ts`, `.config.ts`, and `routeTree.gen.ts` follow their tooling-defined conventions.

Every other descriptive multi-word module name uses kebab-case. TanStack Router's flat-route syntax is the exception: dots separate path segments in route filenames such as `$invoiceId.print.tsx`; those dots are routing syntax, not role suffixes.

## React Principles

### Minimize `useEffect` and `useRef`

Avoid `useEffect` for derived state or data fetching — use TanStack Query and computed values instead. Only use `useEffect` for true side effects such as DOM manipulation and subscriptions. Avoid `useRef` unless interacting with DOM nodes directly.

### Don't derive state from a stable-but-impure hook

The React Compiler memoizes a derived value against its inputs. A hook that returns a referentially stable function which internally reads changing state defeats that: the compiler sees inputs that never change, computes the value once, and freezes it. `useMatchRoute()` is the trap.

Derive such state from a hook that re-reads the store every render instead. For route active state, use `useRouteActive`, never `useMatchRoute`.

### Avoid Prop Drilling

When data needs to flow through multiple component layers, prefer React contexts over passing props through intermediaries. Introduce context when the alternative is drilling through two or more levels, while avoiding frequently updated contexts that cause broad rerenders.

### Push State Down

If a piece of state is only consumed by a single child component, move it into that child. Keep state as close to where it's used as possible. Parent components should not manage state on behalf of children unless the state is shared.

### Small, Focused Components

Aim for components that do one thing and do it well. If a component is growing large or handling multiple responsibilities, break it down into smaller pieces.

Break down components aggressively — don't be afraid to create one-off components solely for improving readability (you can leave them as private to the file if they won't be reused). A component that is 100 lines long is almost always doing too much.

For route components, if they are growing large, put them in their own folder with an `index.tsx` for the main component and additional files for sub-components, hooks, and styles as needed. Remember that filenames like `-components/` will be ignored by TanStack Router's file-based routing.

Use context only when data would otherwise cross multiple intermediate layers.

### Encapsulate Complex Behavior in Custom Hooks

Extract non-trivial logic such as data fetching and transformation, multi-step flows, and complex event handlers into custom hooks. Components should read like a description of the UI, not contain implementation details.

### Destructure to Remove Noise, Not Context

Destructure an object to strip a qualifier that carries no information at the use site; keep the qualifier when it disambiguates or the access is a one-off.

- Destructure when you read the same object's members two or more times and the field names stand on their own: `const { icon, label, color } = actionPresentation(...)` beats repeating `present.icon` / `present.label` / `present.color`.
- When a binding is used only through its fields — a function parameter above all — destructure it where it's introduced, in the parameter list, exactly as you would props. Never introduce the whole object just to destructure it on the next line.
- Passing an object along whole doesn't block destructuring its fields. You can't destructure it away at the declaration, but you can still pull repeated fields in the scope that reads them.
- Keep the qualifier when the field name is generic (`id`, `name`, `type`, `message`) and the owner is what makes it clear — `failure.message`, not a bare `message` floating in scope — and for a one-off read.
- Don't destructure a field out of a discriminated union before the guard that narrows it.

## Module resolution

Relative and alias imports omit the file extension: `from "@/lib/form"`, never `from "@/lib/form.ts"`. This is the Vite website's convention — the opposite of the Node-ESM backend, which requires the explicit `.ts`.

## Stories

Every rendered route has a colocated `<name>.stories.tsx`. Change the route and its story together. Route stories mount the real route tree and cover populated, empty, loading, and error states when the route owns those states.

## References

Read `src/lib/queries/AGENTS.md` before changing query hooks or calling a procedure. Read `src/components/form/AGENTS.md` before changing forms, field components, or error mappings.

## Auth, sessions, and the error-code pipeline

Better Auth owns identity, organizations, members, invitations, and the app-level superadmin role. `unwrapAuthResult` turns action failures into `BetterAuthActionError` with a machine-readable code. That code and tRPC's `data.errorCode` both enter a form's typed `FormErrorConfig`; backend error messages are never rendered.

Role strings may be comma-separated, so decode them through `lib/role.ts` rather than comparing strings directly. Role checks in the website only control presentation; the backend remains authoritative.

`useAuth` is safe above the authenticated boundary. `useUser` requires a session and belongs only below it.
