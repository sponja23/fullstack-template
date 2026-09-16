import { TRPCClientError, createTRPCClient, type TRPCLink } from "@trpc/client";
import { observable } from "@trpc/server/observable";
import type { UserAppRouter } from "@repo/client";

export type FakeTRPCHandler = (input: unknown) => unknown;
export type FakeTRPCHandlers = Record<string, FakeTRPCHandler>;

/** Builds a real user-router client whose terminating link resolves operations from story fixtures. */
export function createFakeUserClient(handlers: FakeTRPCHandlers) {
    const fixtureLink: TRPCLink<UserAppRouter> =
        () =>
        ({ op }) =>
            observable((observer) => {
                const handler = handlers[op.path];
                void Promise.resolve()
                    .then(() => {
                        if (handler === undefined) {
                            throw new Error(
                                `storybook: no fake handler for tRPC ${op.type} "${op.path}"`,
                            );
                        }
                        return handler(op.input);
                    })
                    .then((data) => {
                        observer.next({ result: { type: "data", data } });
                        observer.complete();
                    })
                    .catch((error: unknown) => {
                        const cause =
                            error instanceof Error || (typeof error === "object" && error !== null)
                                ? error
                                : new Error(String(error));
                        observer.error(TRPCClientError.from(cause));
                    });
                return () => {};
            });

    return createTRPCClient<UserAppRouter>({ links: [fixtureLink] });
}
