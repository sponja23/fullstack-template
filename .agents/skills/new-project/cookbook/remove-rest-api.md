# Remove the REST API and API keys

**When:** nothing outside the website will call the backend. API keys exist only to authenticate the REST surface, so they go with it.

## Blast radius

```bash
grep -rlE "rest-api|buildRestApi|apiKey|api-key|API_SCOPES|apiScope" apps packages tools .github --include='*.ts' --include='*.tsx' --include='*.yml' | grep -v routeTree.gen
```

Seams the grep does not name: the `services` object `buildApp` returns for the adapter, the catalog entries only the adapter uses, and the workflow step that runs the adapter's checks.

## Steps

1. **Package.** Delete `packages/rest-api` and its step in `.github/workflows/pr-checks.yml`. Remove the catalog entries that only it used (`pnpm remove` from the package before deleting it keeps the lockfile honest, or run `pnpm install` afterwards and prune the catalog by hand).
2. **api.** Remove the adapter mount and the API-key verifier from the composition root. `buildApp` stops returning `services`.
3. **Auth.** Remove the `apiKey` plugin from `buildAuth` and its schema mapping; delete the API-key schema module and the API-key route directory with its scopes; remove their exports from the package surface.
4. **Website.** Delete the API keys settings page, its query module, the scope labels helper, the settings sidebar entry, and the loader's API-key prefetch.
5. **Storybook.** Remove the API-key world handlers and the settings stories that render keys.
6. **Tests.** Remove the mint-and-verify case from the auth suite.

## Docs that become false

- `packages/backend/AGENTS.md`: "API keys" in the stack bullet.
- `apps/api/AGENTS.md`: any sentence naming the REST adapter as a mounted transport.
- `README.md`: the `packages/rest-api` row.

## Verify

- `pnpm ready` and every suite pass; `pnpm install` reports no orphaned catalog entries.
- The grep above returns nothing.
- `GET /v1/health` is a 404.
