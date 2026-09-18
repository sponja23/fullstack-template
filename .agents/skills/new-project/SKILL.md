---
name: new-project
description: Read when creating a project from this template. Covers the repository, the shape choices and adaptations, deleting the example domain, migrations, the rename, and the hand-off to domain design.
---

# Create a project from the template

The steps below are in order and every project runs all of them. Adaptations that only some projects need are recipes under `cookbook/` in this skill, reached from step 3. This skill, recipes included, is deleted once the project exists; nothing of the template remains.

## 1. Describe the project

Work from a description of what is being built. If none was given, ask for one before anything else: what the product does, who uses it, whether people work alone or in teams, whether other systems will call the API, whether it must send email. Keep the description; it decides the choices in step 3 and seeds the domain in step 10.

## 2. Create the repository

```bash
gh repo create <name> --template sponja23/fullstack-template --private --clone
cd <name>
pnpm install
cp .env.example .env
```

Generate a fresh `BETTER_AUTH_SECRET` in `.env`; the example value is a placeholder.

## 3. Choose the shape

Infer each choice from the description, then confirm the set with the `grilling` skill, presenting your inference as the recommended answer. Ask only what the description leaves open.

| Choice                | Options                                                    | Recipe when not the default                                          |
| --------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------- |
| Tenancy               | organizations (default), personal workspace, users only    | `cookbook/personal-workspace.md`, `cookbook/remove-organizations.md` |
| Superadmin            | keep (default), remove                                     | `cookbook/remove-superadmin.md`                                      |
| REST API and API keys | keep (default), remove                                     | `cookbook/remove-rest-api.md`                                        |
| Sign-in               | password (default), plus social providers, plus magic link | `cookbook/social-sign-in.md`                                         |

Infer the additions the description implies in the same pass (files mean object storage, invitations that must arrive mean an email provider, a brand means a restyle, work outliving a request means a job queue); they are applied in step 5 after the shape recipes. An addition the project does not need yet is left out; its recipe stays readable in the template repository for the day it does.

## 4. Delete the example domain

Before deleting, read one slice end to end as the worked example for every slice this project will write: the client's schema, repository, service, errors, router, query hooks, routes, forms, stories, tests, and REST port. The layer conventions live in the `AGENTS.md` chain, not here.

Then delete the invoicing domain: the `client`, `project`, `time-entry`, and `invoice` slices under `packages/backend/src/routes/`, their schema module and its re-exports, their wiring in `buildApp` and the `services` it returns, the `clients` and `invoices` REST resources with their ports and fakes, the website routes, query modules, and forms for clients, projects, time, and invoices, the dashboard's sidebar links and its index redirect, the Storybook worlds' domain handlers and the deleted routes' stories, the domain terms in `CONTEXT.md`, and their tests. Search for the deleted vocabulary until nothing references it. Completion: `pnpm ready` passes with only the skeleton left (auth, settings, superadmin, REST health and whoami).

## 5. Apply the chosen recipes

Apply the step 3 recipes in this order: tenancy, superadmin, REST API, sign-in, then the additions. Each recipe ends with `pnpm ready` and the backend suite green before the next starts.

A recipe that adds an environment variable adds it to `.env.example` and to the `.env` of every existing checkout; the API validates its environment at startup and refuses to boot on a missing one.

## 6. Regenerate migrations

The migrations under `packages/backend/drizzle` encode the example schema and every table a recipe removed. Delete that directory whole (SQL files and `meta/`), then generate the project's first migration from the schema as it now stands:

```bash
rm -rf packages/backend/drizzle
pnpm db:generate
docker compose down -v
pnpm db:up
```

The volume reset matters: the local database already had the old migrations applied, and the new `0000` would fail against it. Completion: `meta/_journal.json` lists exactly one entry and the backend suite provisions from it.

## 7. Rename Acme

Search the entire checkout before editing; the result is the rename contract:

```bash
grep -Rni --exclude-dir=.git --exclude-dir=node_modules acme .
```

Rename lowercase `acme`, title-case `Acme`, and identifier forms such as `acmeAgency`. `CLAUDE.md` and `.claude/skills` are symlinks: edit their targets, since an in-place rewrite (`sed -i`, `perl -i`) replaces a symlink with a copy. The matches are grouped in these sites:

- Repository identity and guidance: `package.json`, `README.md`, `AGENTS.md`, `.agents/skills/issue-tracker/SKILL.md`, and `docs/agents/triage-labels.md`.
- Local database identity: `.env.example` and `docker-compose.yml`.
- Public product text: `apps/website/index.html`, website route components, and the REST API title.
- Storybook data and assertions: `tools/storybook/browser-smoke.mjs`, `tools/storybook/vite.config.ts`, `tools/storybook/src/`, and colocated `*.stories.tsx` files.

Replace the `sponja23/acme` issue-tracker slug with the new repository owner and name. Repeat the search until nothing remains.

## 8. First run and labels

```bash
pnpm ready
pnpm dev
```

Create the triage labels inside the new clone; `--force` makes the setup repeatable:

```bash
gh label create needs-triage --color D4C5F9 --description "Maintainer needs to evaluate this issue" --force
gh label create needs-info --color FBCA04 --description "Waiting on reporter for more information" --force
gh label create ready-for-agent --color 0E8A16 --description "Fully specified and ready for an agent" --force
gh label create ready-for-human --color 1D76DB --description "Requires human implementation" --force
gh label create wontfix --color FFFFFF --description "Will not be actioned" --force
```

## 9. Remove this skill

This skill describes a project that no longer exists once the steps above are done. Delete `.agents/skills/new-project` whole, recipes included, drop the README's sentence pointing at it, and confirm that `grep -rn fullstack-template .` finds nothing. Then commit.

## 10. Build the domain

Hand the description from step 1 to the `grill-with-docs` skill. It produces `CONTEXT.md` and the first entries under `docs/adr/`, which the empty directory exists for. Slices then follow the layer docs: `packages/backend/AGENTS.md`, `apps/website/AGENTS.md` and the query and form docs beneath it, and the `storybook` skill.

## Cookbook

One file per adaptation under `cookbook/`. Each states when it applies, how to measure its blast radius, the steps, the docs that become false, and how to verify.

- Users work alone and never in teams → `cookbook/remove-organizations.md`
- Users work alone now, teams maybe later → `cookbook/personal-workspace.md`
- No operator role, no impersonation → `cookbook/remove-superadmin.md`
- Nothing external calls the API → `cookbook/remove-rest-api.md`
- Sign in with GitHub, Google, or a magic link → `cookbook/social-sign-in.md`
- Real email delivery before launch → `cookbook/email-provider.md`
- A different look → `cookbook/restyle.md`
- Work that must outlive a request → `cookbook/job-queue.md`
- Files, images, uploads → `cookbook/object-storage.md`
- Putting it on the internet → `cookbook/deployment.md`
