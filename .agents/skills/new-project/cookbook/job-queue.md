# Add a job queue

**When:** work must outlive a request: sending in bulk, calling a slow third party, scheduled cleanup, retries. The template has no queue on purpose; this recipe adds one without the core learning which.

The shape is a **dispatcher port**: the core declares what it wants done, an app decides how it is queued, the harness substitutes a fake. graphile-worker is the example because it runs on the Postgres already in compose and needs no other service.

## Steps

1. **Port in the core.** For a capability, `packages/backend/src/<capability>/<name>.dispatcher.ts` declares an interface with one method per job, its payload a Zod schema (it crosses a process edge). The service that needs it takes the port through its constructor; `buildApp` takes it in `AppDeps`.
2. **Fake in the harness.** A recording fake under `packages/backend/test/` is the default substitute; suites assert on what was dispatched.
3. **Real dispatcher in the api.** `pnpm --filter @repo/api add graphile-worker --save-catalog`. `apps/api/src/<name>.graphile.dispatcher.ts` implements the port with worker utils built from `DATABASE_URL`, one `addJob` per method with the task id and the parsed payload. The composition root constructs it and passes it to `buildApp`.
4. **Worker app.** `apps/worker`, created per the `packages` skill's recipe: an `index.ts` that starts telemetry and dynamically imports `worker.ts`; `worker.ts` builds the same graph the api builds (`buildDb`, `buildAuth`, `buildApp`) and runs graphile-worker with a task list that parses each payload and calls a service. It returns the runner's stop as its teardown. `WORKER_CONCURRENCY` in its env. graphile-worker keeps its own schema in the same database and creates it on first run; the api's migration entrypoint is unaffected.
5. **Wiring.** Root scripts `dev:worker` and its inclusion in `dev`; a Dockerfile copied from the api's with the filter changed; a `ci/checks` composite and its step in `pr-checks.yml`; a second image job in `build.yml`.
6. **Docs.** `apps/worker/AGENTS.md` for the app; a paragraph in `packages/backend/AGENTS.md` naming the port convention (`<name>.dispatcher.ts` in the core, implementation in the app, fake in the harness).

## Verify

- A backend suite drives the service and asserts the fake received the job.
- A worker smoke test runs one task against the harness database.
- `pnpm dev` starts api and worker; dispatching from the website results in the task's log line from the worker, under its own trace.
- Both images build.
