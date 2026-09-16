import { type TRPCClient, type TRPCLink, createTRPCClient } from "@trpc/client";
import type { AnyTRPCRouter } from "@trpc/server";
import { observable } from "@trpc/server/observable";

/** Translates an outgoing tRPC error before the caller's await rejects with it. */
export type BackendErrorMapper = (error: unknown) => unknown;

/** Owns shared tRPC client construction while subclasses supply their transport. */
export abstract class BackendClient<TRouter extends AnyTRPCRouter> {
    readonly trpc: TRPCClient<TRouter>;

    constructor(opts: { transportLink: TRPCLink<TRouter>; errorMapper?: BackendErrorMapper }) {
        const links: TRPCLink<TRouter>[] = [];
        if (opts.errorMapper !== undefined) {
            links.push(errorMappingLink<TRouter>(opts.errorMapper));
        }
        links.push(opts.transportLink);
        this.trpc = createTRPCClient<TRouter>({ links });
    }
}

function errorMappingLink<TRouter extends AnyTRPCRouter>(
    mapper: BackendErrorMapper,
): TRPCLink<TRouter> {
    return () =>
        ({ op, next }) =>
            observable((observer) => {
                const subscription = next(op).subscribe({
                    next: (value) => observer.next(value),
                    error: (error) => {
                        observer.error(mapper(error) as Parameters<typeof observer.error>[0]);
                    },
                    complete: () => observer.complete(),
                });
                return () => subscription.unsubscribe();
            });
}
