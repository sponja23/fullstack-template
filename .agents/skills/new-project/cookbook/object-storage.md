# Add object storage

**When:** the product stores files: uploads, images, generated documents. S3-compatible storage through the AWS SDK, MinIO locally, and presigned URLs for the browser, so no bytes pass through the API and no edge service is needed.

## Steps

1. **Port in the core.** `packages/backend/src/storage/object-storage.ts` declares `ObjectStorage`: `put`, `delete`, `presignGet(key)`, `presignPut(key, contentType)`. Keys are prefixed by the tenant id, and the service that hands out a URL authorizes the caller first. An in-memory fake lives under `packages/backend/test/` and is the harness default.
2. **S3 adapter.** `pnpm --filter @repo/backend add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner --save-catalog`. `S3ObjectStorage` beside the port, built by a `buildObjectStorage(config)` the api calls from env: endpoint, region, bucket, access key, secret, and `forcePathStyle` (MinIO needs it). Objects are put with `Cache-Control: public, max-age=31536000, immutable`; a key is never rewritten, a changed file is a new key.
3. **Deterministic presigning.** A presigned URL embeds its signing time, so a URL minted per request is a new URL per request and the browser cache never hits. Sign with `signingDate` rounded down to a fixed window and `expiresIn` longer than the window, so every mint inside the window yields the same URL:

   ```ts
   const PRESIGN_WINDOW_MS = 24 * 60 * 60 * 1000; // one day: every mint in a day is identical
   const PRESIGN_EXPIRY_S = 2 * 24 * 60 * 60; // must exceed the window; SigV4 caps at 7 days
   const signingDate = new Date(Math.floor(Date.now() / PRESIGN_WINDOW_MS) * PRESIGN_WINDOW_MS);
   getSignedUrl(client, command, { expiresIn: PRESIGN_EXPIRY_S, signingDate });
   ```

   Keep the two constants next to each other with the sentence on why they differ.

4. **Local MinIO.** A `minio` service and a one-shot `minio-setup` that creates the bucket, with root scripts `storage:up` and `storage:down`. Put them under `profiles: [storage]` only when the product runs without files in development; when files are core to it, leave them unconditional and have `db:up` bring the bucket up too, or the API refuses to start on the missing variables. The env example points the S3 variables at it. MinIO allows browser requests from any origin by default; presigned `PUT` from the website works without further CORS setup.
5. **Website.** A query module returns presigned URLs from a procedure; images render with the URL as `src`. Uploads: request a presigned `PUT`, send the file from the browser, then tell the API the key is in place.
6. **Env.** `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_FORCE_PATH_STYLE` in the api env schema, the example file, and your `.env`.

## Docs that become false

- `packages/backend/AGENTS.md`: the dependency-injection section gains the storage port beside the email port.
- `README.md`: the storage profile joins the entry points.

## Verify

- A suite exercises the service through the in-memory fake, including that a caller outside the tenant cannot obtain a URL for its key.
- Against MinIO: two `presignGet` calls for one key within a window return identical URLs; a second page load of an image is served from the browser cache.
- An upload from the website lands in the bucket under the tenant prefix.
