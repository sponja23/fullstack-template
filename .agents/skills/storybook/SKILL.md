---
name: storybook
description: Maintain the Storybook catalog for @repo/ui primitives and website routes. Use when changing a UI component, route, colocated story, world, or the catalog's fake tRPC/auth plumbing.
---

# Storybook catalog

## The rule that keeps it honest

Stories live beside the code they document. Change a component or route and its
`<name>.stories.tsx` together. A new `@repo/ui` export gets a story; a new rendered
website route gets a story. The export and route coverage tests enforce both rules.

## Where things live

The catalog harness lives in `tools/storybook`; stories remain colocated in
`packages/ui` and `apps/website`. Product code and stories never import from the
tooling package. Worlds, environment parameters, fake tRPC/auth plumbing, and the
global decorator live under `tools/storybook/src`.

## Writing a story

### Component stories

Use `Meta` and `StoryObj` from `@storybook/react`, add `tags: ["autodocs"]`, and
cover each meaningful generated variant. Import siblings directly; product code
and stories never import from `tools/`.

### Route stories

Use `Meta`, `StoryObj`, and route parameters from `@storybook/tanstack-react`.
Mount the real route tree and override parent guards and loaders by route id. Cover
populated, empty, loading, and error data axes when the page owns those states.
Choose a named fixture from `tools/storybook/src/worlds.ts`, then override individual
handlers through the plain-data `env` story parameter.

### State axes (page stories)

Skip a generic state axis only with an inline comment saying why. Loading and error
stories render the route's own `pendingComponent` and `errorComponent`; add those
product states or document why that axis does not apply instead of presenting a
blank page or framework screen as product UI.

## Worlds

World handlers are typed from `inferRouterOutputs<UserAppRouter>` so fixtures cannot
drift from the backend contract. Add a world for recurring scenarios and override a
single handler for one-off axes. A loading handler returns a never-resolving promise;
an error handler throws.

## Mounting a page route

Route overrides are keyed by route id, while the story `path` is the route's URL
`fullPath`. Pass that full URL as the `RouterParameters` generic or the type defaults
to route ids.

## Running

Run `pnpm dev:storybook` for the live catalog, `pnpm --filter @repo/storybook test`
for jsdom composition, `pnpm --filter @repo/storybook build` for the static catalog,
and `pnpm --filter @repo/storybook test:browser` for Chromium coverage.

The jsdom smoke composes every story but cannot start route-mounted Storybook router
hooks, so Chromium owns route runtime coverage. Story IDs are the kebab-cased title,
two hyphens, and story name; the complete list is in `dist/index.json` after a build.

## Look at your work — screenshot it

A green smoke only proves mounting. Inspect screenshots of affected stories for
spacing, theme, layout, and state presentation. The catalog follows the operating
system color scheme, so inspect both light and dark for theme-sensitive changes.
