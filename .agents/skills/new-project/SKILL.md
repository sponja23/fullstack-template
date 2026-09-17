---
name: new-project
description: Read when creating a project from this template or when asked to rename or restyle it.
---

# Create a project from the template

## Create the repository

Create and enter a private clone:

```bash
gh repo create <name> --template sponja23/fullstack-template --private --clone
cd <name>
```

## Rename Acme

Search the entire checkout before editing; the result is the rename contract:

```bash
grep -Rni --exclude-dir=.git --exclude-dir=node_modules acme .
```

Rename lowercase `acme`, title-case `Acme`, and identifier forms such as `acmeAgency`. The matches are grouped in these sites:

- Repository identity and guidance: `package.json`, `README.md`, `AGENTS.md`, this skill, `.agents/skills/issue-tracker/SKILL.md`, and `docs/agents/triage-labels.md`.
- Local database identity: `.env.example` and `docker-compose.yml`.
- Public product text: `apps/website/index.html`, website route components, and `packages/rest-api/src/rest-api.ts`.
- Storybook data and assertions: `tools/storybook/browser-smoke.mjs`, `tools/storybook/vite.config.ts`, `tools/storybook/src/`, and colocated `*.stories.tsx` files under `apps/website/src/routes/`.

Replace the `sponja23/acme` issue-tracker slug with the new repository owner and name, but keep `sponja23/fullstack-template` as this skill's template source. Generate a fresh `BETTER_AUTH_SECRET` in `.env`; never reuse the example value. Repeat the search until only intentionally retained template-source text remains.

## First run

```bash
pnpm install
cp .env.example .env
pnpm db:up
pnpm ready
pnpm dev
```

## Apply a different shadcn preset

1. Build a preset at <https://ui.shadcn.com/create>.
2. From `packages/ui`, run `pnpm exec shadcn apply <preset-code>`.
3. Update `package.json` subpath exports so every generated primitive is exported and removed primitives are absent.
4. Update each colocated story for changed component APIs or variants.
5. Run `pnpm --filter @repo/storybook test`, `pnpm --filter @repo/storybook test:browser`, and `pnpm --filter @repo/storybook build`.
6. Inspect screenshots of representative stories in both light and dark color schemes before accepting the restyle.

## Replace the example domain

Delete the `client`, `project`, `time-entry`, and `invoice` slices under `packages/backend/src/routes/`, their database schemas and migrations, matching website routes and queries, Storybook worlds and stories, REST resources, and `CONTEXT.md`. Search for the deleted vocabulary to find consumers, then replace the example with the new domain and run `pnpm ready`.

## Create triage labels

Run these commands inside the new clone; `--force` makes the setup repeatable:

```bash
gh label create needs-triage --color D4C5F9 --description "Maintainer needs to evaluate this issue" --force
gh label create needs-info --color FBCA04 --description "Waiting on reporter for more information" --force
gh label create ready-for-agent --color 0E8A16 --description "Fully specified and ready for an agent" --force
gh label create ready-for-human --color 1D76DB --description "Requires human implementation" --force
gh label create wontfix --color FFFFFF --description "Will not be actioned" --force
```
