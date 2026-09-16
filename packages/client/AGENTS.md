# @repo/client

Browser-safe, typed wire clients that dial the backend's tRPC routers. This package carries the transport, not the API surface: per-endpoint call methods belong to leaf consumers, never here.

Client-class implementations use the `<name>.client.ts` suffix.

## Base / subclass split

`BackendClient<TRouter>` owns everything shared: it builds the tRPC client and wires the optional `errorMapper` link. The one piece it does not own is the transport link, because that differs between principals. Each principal client builds its own link and hands it to `super`; there is one link per principal.

`UserClient` uses `httpBatchLink` with `credentials: "include"`. The UI fans out many queries per render, so batching keeps the wire bounded while the credentials option sends the session cookie.

When adding a principal, build its link, hand it to `super`, add its auth-specific fields, and put API-interaction methods in the leaf consumer rather than on the client.

## Error mapping

`errorMapper` translates an outgoing tRPC error before the caller's `await` rejects with it. `errorMappingLink` applies it to every operation: return the input unchanged to leave the error alone, or return a different value to substitute it.

## Paths

The tRPC mount paths live in `paths.ts`, beside the clients that dial them, so a client builds its HTTP link from the same constant the API mounts the router at.

## Contract re-exports

Backend router types are re-exported type-only from `index.ts`, so consumers depend on `@repo/client` alone for wire contracts with no runtime dependency on `@repo/backend`.
