# Backend Package — Node + tRPC + Drizzle Conventions

## Stack

- Node ESM TypeScript, run through `tsx` in development and emitted with Vite+.
- tRPC with `superjson`; each principal owns a procedure and router.
- Drizzle ORM over Postgres through `node-postgres`.
- better-auth for credentials, sessions, organizations, administration, and API keys.
- Zod at boundaries; `@repo/logger` and `@repo/telemetry` for observability.
- Vitest against a real Postgres: one source per run and a fresh clone per suite.

## Controller–Service–Repository

Each domain resource lives under `src/routes/<resource>/` with up to three layers:

- Repository (`*.repository.ts`) is the only layer touching the database. It extends `DatabaseRepository`. Methods participating in caller-owned transactions accept a final `executor: DatabaseExecutor = this.database`.
- Service (`*.service.ts`) owns domain logic and transactions, orchestrates repositories, and throws domain errors.
- Router (`*.<principal>.router.ts`) validates with Zod, calls one service method, and returns the result. Declare builders with `satisfies <Principal>RouterBuilder<Deps>`.

Split repositories by table and owner; group by feature at the service and router layers. Repositories are private to their module. A cross-module dependency uses the other module's service interface.

Capabilities owned by better-auth are used directly. When auth configuration needs application data, inject a predicate or port instead of querying inside `buildAuth`. Invitation delivery through `EmailSender` is the local example. A read-only model over auth tables is acceptable when no API exposes the query; it never writes those tables.

## Boundary schemas

Co-locate a Zod schema with its consumer. Promote it to `src/lib/` only when multiple slices share it. Keep cross-cutting concerns in named directories rather than loose under `routes/`.

Drizzle tables under `src/db/schema/` are the source of truth. Derive rows with `$inferSelect`; use enum columns, checks, compound constraints, and typed JSON columns to make invalid storage states impossible. Export each closed tuple and its derived union.

## Principals and procedures

- User: `authProcedure` guarantees an authenticated `Session`; `orgProcedure` additionally guarantees `OrgSession` with an active organization.
- Superadmin: `superadminProcedure` guarantees the application-level `superadmin` role without requiring an active organization.

Choose the narrowest procedure that guarantees a resolver's context. Build new procedures with `buildXProcedures(baseProcedure, deps)` and wire them in `buildApp`.

## Dependency injection

`buildApp` constructs the graph once: repositories take the database, services take repositories, and routers take services and procedures. It returns routers, the context factory, and typed caller factories for tests and scripts.

Environment is read only in `apps/api/src/env.ts`; the parsed values enter `buildDb`, `buildAuth`, and `buildApp`. The backend stays Hono-free. `apps/api/src/server.ts` owns HTTP and concrete adapters.

`EmailSender` is the outbound email port. `buildAuth` receives it for invitations and password resets. The API uses `LoggingEmailSender`; a project may replace that adapter without changing the backend.

## Errors

Every backend error extends `BackendError`, carrying a closed `BackendErrorCode` and a tRPC code. Resource errors extend an intermediate such as `NotFoundError` or `ConflictError`. Add every new code to the union.

Annotate user-reachable database constraints with `satisfies ConstraintName` and register them in the exhaustive `ConstraintViolationRegistry`. The tRPC middleware maps recognized Postgres unique, check, and foreign-key violations to domain errors while preserving the driver cause.

## Logging and telemetry

Import the global logger and create a named child at module or class scope. The tRPC middleware opens a span per procedure and scopes `trpcPath` and `trpcType` tags.

## Module resolution

Relative Node ESM imports include `.ts`. This package is consumed through the `@repo/source` condition. Load the `packages` skill before changing manifests, configs, exports, or build behavior.

## Testing

Integration tests use real Postgres. Global setup resolves `TEST_PG_ADMIN_URL` when present or starts a testcontainer, migrates one template per run, and clones a database per suite. `TestHarness` constructs the production graph through `buildApp`, seeds a user and organization, and exposes typed callers. Substitute only the `EmailSender`; do not mock internal collaborators or export internals for tests.
