# Acme full-stack template

Acme is a docs-first, runnable skeleton for TypeScript web applications. It includes a small invoicing domain so the architecture, boundaries, tests, and development workflow are executable rather than illustrative.

The inclusion rule is simple: this template contains only foundations that a future full-stack project can adopt unchanged or with a rename. Product-specific integrations, infrastructure, and hosting choices belong in projects created from the template.

## Stack

| Area           | Technology                                                   |
| -------------- | ------------------------------------------------------------ |
| Workspace      | pnpm workspaces and Vite+                                    |
| API            | Node.js, Hono, tRPC, Zod                                     |
| Data           | PostgreSQL and Drizzle ORM                                   |
| Authentication | Better Auth                                                  |
| Website        | React, Vite, TanStack Router, Query, and Form                |
| UI             | Tailwind CSS, shadcn, and Storybook                          |
| Tests          | Vitest, Playwright, and real disposable PostgreSQL databases |
| Observability  | OpenTelemetry and Pino                                       |

## Local setup

Requires Node.js 22+, pnpm, and Docker.

```bash
pnpm install
cp .env.example .env
pnpm db:up
pnpm ready
pnpm dev
```

The website runs at <http://localhost:5173> and the API at <http://localhost:3000>. Run `pnpm db:down` when finished. Storybook is available separately with `pnpm dev:storybook`.

## Documentation

Project guidance has three homes:

- Area-specific conventions live in the nearest `AGENTS.md`.
- Cross-cutting workflows and structural rules live under `.agents/skills/`.
- Decisions and considered alternatives live under `docs/adr/`.

Start with [AGENTS.md](./AGENTS.md) for repository-wide conventions and [CONTEXT.md](./CONTEXT.md) for domain language. When creating a repository from this template, follow the [`new-project` skill](./.agents/skills/new-project/SKILL.md).
