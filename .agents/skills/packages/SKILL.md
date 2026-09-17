---
name: packages
description: Always read before editing workspace manifests, TypeScript/Vite/Vitest configs, Dockerfiles, or app entrypoints, and before diagnosing module-resolution or missing telemetry spans. Covers workspace boundaries, catalog dependencies, live-source exports, builds, and telemetry bootstrap ordering.
---

# Package Structure & Dependencies

## Apps, packages, and tools

- **`apps/*`** are runnable units with an entrypoint, such as `apps/api` and `apps/website`.
- **`packages/*`** are reusable libraries, such as `backend`, `logger`, `telemetry`, `rest-api`, `ui`, and `utils`.
- **`tools/*`** are internal runnable tooling, such as the Storybook catalog.

`tools/` is a dependency sink: a tool may import from apps and packages, while nothing in apps or packages imports from tools. Because apps have no package exports, a tool reaches app source through an explicit alias rather than `@repo/<app>` resolution; `tools/storybook/vite.config.ts` is the local example.

### The `tools/` sink invariant

The product dependency graph never points into `tools/`. This lets internal tooling inspect and render product code without becoming a product dependency.

## Dependencies

### External dependencies go in the catalog

All external dependencies are pinned once in the root `catalog:` and referenced as `"catalog:"` from consuming manifests. Internal dependencies use `"workspace:*"`.

### Never write a version manually

Never type an external version manually. Resolve it through pnpm from the package that needs it:

```bash
pnpm --filter @repo/backend add <pkg> --save-catalog
pnpm --filter @repo/backend add -D <pkg> --save-catalog
pnpm update <pkg> --save-catalog --latest
```

### Internal dependencies use `workspace:*`

There is no published internal version to pin; workspace packages depend on one another with `"workspace:*"`.

## Live types: the `@repo/source` condition

Node-side packages expose source to in-repository consumers and compiled JavaScript to plain Node:

### Library package exports

```json
{
  "files": ["dist"],
  "exports": {
    ".": {
      "@repo/source": "./src/index.ts",
      "default": "./dist/index.js"
    }
  }
}
```

Order matters: `@repo/source` comes before `default`. `files: ["dist"]` ensures `pnpm deploy` includes compiled output.

There is no `types` condition: in-repository consumers get types from source, while Vite+ emits no declarations. Add one only when a package genuinely publishes declarations to an external consumer.

Every resolver must enable the condition:

- TypeScript inherits `customConditions: ["@repo/source"]` from `config/tsconfig/base.json`.
- Node/tsx commands pass `--conditions=@repo/source`.
- Vitest sets both `resolve.conditions` and `ssr.resolve.conditions`.
- Vite consumers set `resolve.conditions`.

### Subpath exports

Runtime subpath exports pointing into `dist/` also need matching build entries when the build would not otherwise emit them. Test-only subpaths may point directly at source.

Relative imports in Node ESM source include explicit `.ts` extensions. Vite+ rewrites them when emitting JavaScript.

### Named exports only

Use named exports. `src/index.ts` is a barrel with deliberate re-exports and no implementation. When code moves, update importers instead of leaving compatibility facades.

## tsconfig

Node libraries extend `@repo/tsconfig/node.json` and use one `tsconfig.json` for sources and tests. Vite+ emits `dist/` through Rolldown `preserveModules`; do not add a second tsc build config.

## Vite configs

A node library's build config keeps bare specifiers external and preserves source modules:

```ts
build: {
    target: "node22",
    outDir: "dist",
    lib: { entry: { index: "src/index.ts" }, formats: ["es"] },
    rollupOptions: {
        external: (id) => !id.startsWith(".") && !isAbsolute(id),
        output: { preserveModules: true, preserveModulesRoot: "src", entryFileNames: "[name].js" },
    },
}
```

## Apps that load packages

App development commands use Node directly so the custom condition reaches the resolver:

```json
"dev": "node --watch --import=tsx --conditions=@repo/source --env-file=../../.env src/index.ts"
```

Production starts compiled output without the custom condition, selecting package `default` exports.

## Apps that emit telemetry

Automatic HTTP and Postgres instrumentation patches modules at import time. Start telemetry before importing application modules:

```ts
import { runWithTelemetry } from "@repo/telemetry";

await runWithTelemetry({ serviceName: "api" }, async () => {
  const { start } = await import("./server.ts");
  return start();
});
```

Keep the entry limited to telemetry bootstrap. A static import of the server or anything that transitively loads `http` or `pg` silently loses automatic spans. Keep the `.ts` extension so the build rewrites it. Return teardown from `start()` and let the wrapper handle signals and flush telemetry last.

The service name belongs in code. `OTEL_EXPORTER_OTLP_ENDPOINT` turns telemetry on; absence keeps development and tests zero-config.

## Vitest configs

Every config loading workspace packages includes both resolver layers:

```ts
export default defineConfig({
  resolve: { conditions: ["@repo/source"] },
  ssr: { resolve: { conditions: ["@repo/source"] } },
});
```

## Docker / deploy

The standard multi-stage shape is:

1. Install with development dependencies, then run `pnpm --filter @repo/<app>... build` so every workspace dependency emits `dist/`.
2. Run `pnpm deploy --filter @repo/<app> --prod --legacy /out`.
3. Copy `/out` into a runtime image and run `node ./dist/index.js` without the source condition.

For telemetry, pass `SERVICE_VERSION` as a build argument and set `OTEL_RESOURCE_ATTRIBUTES="service.version=$SERVICE_VERSION"` in the runtime stage.

## Grouping files inside a package

Group files by capability, not kind. Co-locate a capability's implementation, schemas, and tests; keep only genuinely shared vocabulary at the package root.

## Creating a new package

1. Choose `apps/<name>` for a runnable unit or `packages/<name>` for a library.
2. Add the standard manifest with live-source/default exports and `files: ["dist"]`.
3. Add one tsconfig extending `@repo/tsconfig/node.json` and add `@repo/tsconfig` as a workspace development dependency.
4. Add the preserve-modules Vite+ build config and a barrel-only `src/index.ts`.
5. Add internal and external dependencies through pnpm.
6. If it has tests, configure both Vitest resolver conditions.
7. Run `pnpm install`, then `pnpm ready`.

## Quick failure → fix table

| Symptom                                                  | Likely cause                                                                                   |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Node rejects TypeScript under `node_modules`             | A tsx command is missing `--conditions=@repo/source`, or the package lacks a default export.   |
| Runtime cannot find `dist/index.js`                      | The package lacks `files: ["dist"]`, or its build did not run.                                 |
| A subpath works in checks but fails from compiled output | The subpath lacks a matching build entry.                                                      |
| Vitest cannot resolve a workspace package                | `ssr.resolve.conditions` is missing.                                                           |
| `pnpm deploy` rejects a workspace package                | Pass `--legacy` or configure injected workspace packages.                                      |
| HTTP/Postgres spans are missing                          | The app loaded server modules before telemetry bootstrap; move them behind the dynamic import. |
