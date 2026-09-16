# syntax=docker/dockerfile:1-labs

FROM node:22-alpine AS builder

ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    PNPM_STORE_DIR=/pnpm/store \
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

RUN apk add --no-cache git
RUN corepack enable && corepack prepare pnpm@10.33.3 --activate

WORKDIR /repo

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json vite.config.ts ./
COPY --parents apps/api/package.json packages/*/package.json config/*/package.json ./
RUN --mount=type=cache,target=$PNPM_STORE_DIR \
    pnpm install --filter @repo/api... --frozen-lockfile --store-dir "$PNPM_STORE_DIR"

COPY . .
RUN pnpm --filter @repo/api... build
RUN pnpm deploy --filter @repo/api --prod --legacy /out

FROM node:22-alpine

ENV NODE_ENV=production
ENV NODE_OPTIONS=--enable-source-maps

ARG SERVICE_VERSION=dev
ENV OTEL_RESOURCE_ATTRIBUTES="service.version=$SERVICE_VERSION"

WORKDIR /app
COPY --from=builder /out ./
COPY --from=builder /repo/packages/backend/drizzle ./drizzle

CMD ["node", "./dist/index.js"]
