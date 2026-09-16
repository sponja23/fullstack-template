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

Schemas are the source of truth at boundaries. Anything crossing a process, network, or storage edge is defined as a Zod schema; derive the runtime type with `z.infer`.

Make illegal states unrepresentable: prefer discriminated unions over flag booleans and handle unions exhaustively.

`any`, `!`, and `as` are escape hatches. Use them only when the alternative is worse.

### Dependency injection

Construct dependency graphs at startup. Components receive dependencies through constructor parameters. Keep module-level singletons and hidden global state out of application code.

Environment variables are read only during dependency construction. Internal code accesses configuration through injected dependencies, never through `process.env`.

This lets tests substitute real-but-disposable resources such as a fresh Postgres database while running production code unchanged.

### Testing

Tests exercise real behavior. When dependencies are heavy, use real-but-disposable substitutes. Fakes are acceptable for capabilities that cannot run locally, as long as the code under test stays unchanged.

Avoid tests that mock internal collaborators and assert call shapes. Those tests couple to implementation and break on refactors without proving behavior.

### Logging

The logger is the one exception to dependency injection. Import the global logger from `@repo/logger` and create a child with a descriptive name at module or class scope.

Log enough context to debug behavior. Default to `info`; reserve `debug` for noisy or temporary instrumentation.

### Comments

Comments carry what code cannot: the reason behind a non-obvious decision, an invariant, an ordering constraint, or a gotcha. They must stand alone for a reader with no history of the change.

Keep them short. A doc comment gets one sentence by default. Longer design reasoning belongs in one of three homes:

- an area convention a future author must follow → the nearest `AGENTS.md`;
- a cross-cutting structure or build rule → the matching skill under `.agents/skills/`;
- a design decision and alternatives → an entry under `docs/adr/`.

Do not write ghost comments about prior implementations, refactors, reviews, or plans. Do not restate code or leave commented-out code.

Open work may name a ticket only as `// TODO -- <description> (#XXX)`. Implementing the issue removes the comment.

Repository instructions live in directory-scoped `AGENTS.md` files. Sibling `CLAUDE.md` files are compatibility symlinks. Read the instruction chain from the root through a path before editing; the nearest file wins.

## Agent skills

### Issue tracker

Issues live as GitHub issues on `sponja23/acme`. Load the `issue-tracker` skill before creating, reading, listing, triaging, commenting on, or closing an issue.

### Triage labels

Five canonical triage-state labels map to their own names. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context projects use `CONTEXT.md` and `docs/adr/`, created lazily. See `docs/agents/domain.md`.

### Workflow skills

`grill-with-docs`, `to-tickets`, `implement`, and `triage` are optional user-level skills from a public repository. They are referenced by name and are not stored here.
