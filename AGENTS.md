# Acme

`acme` is a full-stack invoicing application and a reusable project skeleton.

## Stack

TypeScript monorepo managed with [Vite+](https://vite.plus) on top of `pnpm` workspaces.

Three top-level workspace groups:

- **`apps/*`** — deployable units with an entrypoint (run, not imported).
- **`packages/*`** — libraries consumed via `@repo/<name>` (imported, not run).
- **`tools/*`** — internal development tooling that is never shipped as product.

`tools/` is a dependency sink: it may import from `apps/` and `packages/`, while product code never imports from `tools/`. See the `packages` skill for the full rationale.

### TypeScript filenames

A dotted filename (`<subject>.<role>.ts[x]`) declares a recognized component or artifact type with a repository-defined convention, such as a service, repository, router, schema, error family, protocol, test, story, or config. Use kebab-case for ordinary descriptive multi-word modules.

## Commands

Day-to-day workflows are wrapped in root scripts:

```bash
pnpm dev
pnpm dev:web
pnpm dev:api
pnpm ready
```

For static checks, tests, and builds inside a package, use Vite+ directly:

```bash
vp check
vp test
vp build
```

## Principles

### Type safety

Schemas are the source of truth at boundaries. Anything crossing a process, network, or storage edge is defined as a Zod schema; the runtime type is derived via `z.infer`. Don't hand-write a parallel type next to a schema.

Make illegal states unrepresentable: prefer discriminated unions over flag booleans, and handle the union exhaustively at the consumer.

`any`, `!`, and `as` are escape hatches — discouraged by default but acceptable when the alternative is worse. Use judgment.

### Dependency injection

Construct dependency graphs at startup. Components receive their dependencies via constructor parameters. No module-level singletons or hidden global state unless explicitly instructed by the user.

Environment variables are read only during dependency construction. Internal code accesses configuration through injected dependencies, never through `process.env`.

This lets tests substitute real-but-disposable resources such as a fresh Postgres database while running production code unchanged.

### Testing

Tests exercise real behavior. When dependencies are heavy, use real-but-disposable substitutes. Fakes are acceptable for capabilities that cannot run locally, as long as the code under test stays unchanged.

Avoid tests that mock internal collaborators and assert call shapes. Those tests couple to implementation and break on refactors without proving behavior.

### Logging

The logger is the one exception to dependency injection. Import the global logger from `@repo/logger` and create a child with a descriptive name at module or class scope.

Log aggressively to make debugging easy. Default to `info`; reserve `debug` for logs that would otherwise be too noisy, or for temporary instrumentation added for a specific investigation.

### Comments

Comments carry what code cannot: the reason behind a non-obvious decision, an invariant, an ordering constraint, or a gotcha. They must stand alone for a reader with no history of the change.

Keep them short. A doc comment gets one sentence by default; a second is warranted only to name an invariant a reader could plausibly break by editing this code. Anything longer is design reasoning and moves to the home that fits:

- an area convention a future author must follow → the nearest `AGENTS.md`;
- a cross-cutting structure or build rule → the matching skill under `.agents/skills/`;
- a design decision and alternatives → an entry under `docs/adr/`.
- a genuinely breakable invariant on this code → it stays inline, trimmed to the constraint.

Never write ghost comments: references to prior implementation ("previously…", "no longer…", "used to…"), a refactor, a PR, a plan, or review feedback. State only what is true now. Don't restate code, echo the signature, or leave commented-out code behind.

Work an open issue will do is the one thing inline may name a ticket, exactly as `// TODO -- <description> (#XXX)`. The named issue deletes the comment. A TODO with no issue, or naming a closed one, is a ghost comment by another name.

Don't re-explain at a consumer what its source already documents. State only what the code at hand adds; copy shared explanations into one canonical home rather than sibling files.

Repository instructions live in directory-scoped `AGENTS.md` files. Sibling `CLAUDE.md` files are compatibility symlinks. Before designing, planning, or editing a path, read the instruction chain from the root through that path; the nearest file wins. Cross-cutting structure and build conventions live in the matching skill; design decisions and their alternatives live in `docs/adr/`.

## Agent skills

### Issue tracker

Issues live as GitHub issues on `sponja23/acme`. Load the `issue-tracker` skill before creating, reading, listing, triaging, commenting on, or closing an issue.

### Triage labels

Five canonical triage-state labels map to their own names. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context projects use `CONTEXT.md` and `docs/adr/`, created lazily. See `docs/agents/domain.md`.

### Workflow skills

`grill-with-docs`, `to-tickets`, `implement`, and `triage` are optional user-level skills from a public repository. They are referenced by name and are not stored here.
