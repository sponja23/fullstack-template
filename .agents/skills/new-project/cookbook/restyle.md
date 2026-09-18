# Apply a different shadcn preset

**When:** the product needs a different look. `packages/ui` is CLI output plus an override layer, so the look is a preset, not a set of edits; its `AGENTS.md` records the current preset code.

## Steps

1. Build a preset at <https://ui.shadcn.com/create> and copy its code.
2. From `packages/ui`, run `pnpm exec shadcn apply <preset-code>`. It rewrites the generated primitives, fonts, and the preset-managed CSS variables; the override stylesheet and the custom components directory are untouched. A preset that keeps the same style (`nova` to `nova` with other colors, fonts, or radius) changes tokens and fonts only, so no story needs work.
3. The CLI writes literal versions into `package.json` for anything it installs (fonts, `shadcn` itself). Restore `catalog:` per the `packages` skill and run `pnpm install`.
4. Regenerate the subpath exports in `packages/ui/package.json` so every generated primitive is exported and removed ones are absent.
5. Update each colocated story for changed component APIs or variants; the export coverage test tells you which primitives lost a story.
6. Record the new preset code in `packages/ui/AGENTS.md`.
7. Run `pnpm --filter @repo/storybook test`, `test:browser`, and `build`.
8. Screenshot representative stories in both color schemes and look at them before accepting the restyle.

## Verify

- The catalog builds and both smokes pass.
- `pnpm exec shadcn preset resolve` in `packages/ui` prints the recorded code.
