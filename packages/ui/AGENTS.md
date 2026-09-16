# @repo/ui

This package is shadcn CLI output for preset `b2fA` (Nova, Base UI, neutral, Geist,
Lucide, default radius). Preview it at <https://ui.shadcn.com/create?preset=b2fA>.

Files managed by the CLI — `components.json`, the generated implementation files
under `src/components/ui/` (excluding `*.stories.tsx`), and the preset-managed
`src/styles/globals.css` — remain byte-identical to regeneration.
Customize the system in `src/styles/app.css`, compose shared product components in
`src/components/custom/`, or apply a new preset with the shadcn CLI.

Every exported primitive has a colocated `<name>.stories.tsx`. Load the `storybook`
skill when changing a primitive or its story, and update both in the same change.
