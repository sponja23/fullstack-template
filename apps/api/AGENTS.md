# apps/api

The HTTP entrypoint for `@repo/backend`: it reads and parses environment (`src/env.ts`, via `@t3-oss/env-core`) at the process edge and constructs the object graph through `buildApp`, and it is the only place that knows Hono, ports, and concrete adapters (`src/server.ts`).

Backend conventions for CSR layering, principals and procedures, dependency injection, errors, schemas, and testing live in [`packages/backend/AGENTS.md`](../../packages/backend/AGENTS.md).

The entry imports only `@repo/telemetry` and loads `server.ts` dynamically after instrumentation starts. `server.ts` owns graph construction and returns teardown to the telemetry lifecycle.
