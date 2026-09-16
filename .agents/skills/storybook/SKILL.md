---
name: storybook
description: Maintain the Storybook catalog for @repo/ui primitives and website routes. Use when changing a UI component, route, colocated story, world, or the catalog's fake tRPC/auth plumbing.
---

# Storybook catalog

Stories live beside the code they document. Change a component or route and its
`<name>.stories.tsx` together. A new `@repo/ui` export gets a story; a new rendered
website route gets a story. The export and route coverage tests enforce both rules.

## Component stories

Use `Meta` and `StoryObj` from `@storybook/react`, add `tags: ["autodocs"]`, and
cover each meaningful generated variant. Import siblings directly; product code
and stories never import from `tools/`.

## Route stories

Use `Meta`, `StoryObj`, and route parameters from `@storybook/tanstack-react`.
Mount the real route tree and override parent guards and loaders by route id. Cover
populated, empty, loading, and error data axes when the page owns those states.
Choose a named fixture from `tools/storybook/src/worlds.ts`, then override individual
handlers through the plain-data `env` story parameter.

## Verification

Run `pnpm --filter @repo/storybook test`, `build`, and `test:browser`. A green smoke
only proves mounting; inspect screenshots of affected stories for spacing, theme,
layout, and state presentation. The catalog follows the operating system color
scheme, so inspect both light and dark for theme-sensitive changes.
