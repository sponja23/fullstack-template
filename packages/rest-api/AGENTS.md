# @repo/rest-api — the versioned external REST adapter

A transport-adapter package: a curated, organization-scoped `/v1` REST surface over domain services in `@repo/backend`, built with `@hono/zod-openapi` and Scalar. The Hono/OpenAPI coupling lives here so `@repo/backend` stays Hono-free.

`buildRestApi(deps)` returns an `OpenAPIHono` that owns the `/v1` prefix through `.basePath`; route modules use relative paths and never repeat `/v1`. `apps/api` mounts it at the root.

## Dependency injection — the adapter never reaches into the backend

Everything the adapter needs crosses an injected seam, so it depends on better-auth and services only through narrow interfaces it defines, and tests substitute fakes:

- `ApiKeyVerifier` verifies a raw key into an organization principal and scopes; the composition root binds it to better-auth and tests pass `fakeVerifier`.
- Resource ports such as `ClientsPort` and `InvoicesPort` are narrow interfaces structurally satisfied by backend services; tests pass the matching fakes. A controller calls a port, never a repository.

Add a resource by defining its port next to its route module and wiring the real service in `apps/api`.

## Defining a route — use the authenticated-route builder

Every endpoint requiring an API key goes through `createRouteRegistrar(app, verifier)` and its `registerRoute(spec)` result in `src/http/authenticated-route.ts`. The builder hides the API-key guard and security scheme, scope gate, standard 400/401/403 responses, request validation, and Hono plumbing. The config keeps the public contract explicit: method, path, request schemas, and success response schemas and statuses.

A route whose body callers may omit sets `request.bodyRequired: false`; its schema must accept `{}`, since `@hono/zod-openapi` installs no validator for an optional body and the builder validates one itself, treating an absent or empty body as an empty object.

Use `registerRoute` for resource endpoints rather than hand-writing `createRoute` and `app.openapi`. `health` is the public unauthenticated exception.

## Scopes

API keys carry flat `resource:action` strings from `@repo/backend`'s closed `API_SCOPES` set in better-auth metadata. A route's `scope` adds `requireScope`; authentication is verify-then-gate, so an invalid key returns 401 while a valid key missing the scope returns 403.

## Errors

Controllers call a port and let a domain `BackendError` propagate to the app's `onError` in `src/http/backend-error.ts`, which maps it to an HTTP status and returns its `errorCode`. Anything else is an opaque 500.

## Testing

Drive the `OpenAPIHono` through `app.request(...)` with the injected fakes under `test-support/`. Routing, middleware, error mapping, and response shaping remain real; backend integration tests prove the production verifier and service halves.
