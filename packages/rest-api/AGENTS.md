# @repo/rest-api

This package is the versioned external REST transport over backend services. `buildRestApi` owns the
`/v1` prefix; route modules declare relative paths. Every authenticated endpoint is registered through
`createRouteRegistrar`, which centralizes API-key verification, scope gates, validation, and standard
error responses. Resource modules depend only on their local `ClientsPort` or `InvoicesPort`; production
wires backend services and tests use the fakes under `test-support/`.

API keys carry the closed scopes exported by `@repo/backend` in better-auth metadata. Authentication is
verify-then-gate: invalid keys return 401 and valid keys without a required scope return 403.
