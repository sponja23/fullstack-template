# Deploy

**When:** the project goes on the internet. The template makes no hosting choice; this recipe states the contract each app has with any host, gives one worked path per app, and asks which platform the project wants.

Ask the user for their API platform before starting; Fly.io below is the example, not the answer. Record the choice and its alternatives as an entry under `docs/adr/`.

## The contract

**API.** `apps/api/Dockerfile` builds the image; pass the git SHA as `SERVICE_VERSION` so traces carry it. The image needs every variable `apps/api/src/env.ts` declares. Before each rollout, run `node dist/migrate.js` in the same image with only `DATABASE_URL`; it is forward-only and idempotent. `GET /` answers `ok` for health checks (`/v1/health` if the REST API is kept). The process listens on `PORT` and shuts down cleanly on `SIGTERM`. Traces and logs go wherever `OTEL_EXPORTER_OTLP_ENDPOINT` points; unset means off.

**Website.** `pnpm --filter @repo/website build` emits static files to `apps/website/dist`. `VITE_API_URL` is baked at build time, so preview builds need their own value. The host must serve `index.html` for unknown paths.

**Two hosts, one session.** With the website on `app.example.com` and the API on `api.example.com`: `WEB_URL` is the website origin (CORS and trusted origin), `AUTH_TRUSTED_HOSTS` is the API's public host, and `AUTH_COOKIE_DOMAIN=.example.com` scopes the session cookie to the registrable domain and flips it to `Secure`. Locally all three stay unset.

## Worked path: website on Cloudflare Pages

Connect the repository to a Pages project with production branch `main`, framework preset Vite, build command `pnpm install --frozen-lockfile && pnpm --filter @repo/website build`, output directory `apps/website/dist`, root directory the repository root. Set `VITE_API_URL` and `NODE_VERSION=22` as build variables. Add the custom domain under the project; Pages provisions DNS and TLS. Every push to `main` deploys, every pull request gets a preview.

## Worked path: API on Fly.io (example)

```bash
fly launch --no-deploy --dockerfile apps/api/Dockerfile
```

In `fly.toml`: `[build] dockerfile = "apps/api/Dockerfile"` with `build-args` for `SERVICE_VERSION`; `[deploy] release_command = "node dist/migrate.js"`; `[http_service] internal_port = 3000` with an HTTP check on `/`. Provide Postgres (`fly postgres create` and `fly postgres attach`, or an external instance) and set the rest with `fly secrets set`. `fly certs add api.example.com` after pointing DNS. Then `fly deploy`; the release command migrates before the new machine takes traffic.

## Docs that become false

- `README.md`: add where the project runs and how it deploys, pointing at the ADR.

## Verify

- `build.yml` builds the image on `main`; the deployed image reports the SHA in its traces.
- Migrations ran before the first request: the API boots against the migrated database.
- Sign in on the website sets a cookie the API accepts on the other host; sign out clears it.
- A pull request preview of the website reaches the API it was built for.
