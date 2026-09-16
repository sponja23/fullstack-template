import { defaultFakeSession, type FakeSession } from "./fake-auth";
import type { FakeTRPCHandlers } from "./fake-trpc";

export interface SeededQuery {
    queryKey: readonly unknown[];
    data: unknown;
}

export interface World {
    session: FakeSession | null;
    handlers: FakeTRPCHandlers;
    queries?: readonly SeededQuery[];
}

const acme: World = {
    session: defaultFakeSession,
    handlers: {
        me: () => ({
            id: defaultFakeSession.user.id,
            name: defaultFakeSession.user.name,
            email: defaultFakeSession.user.email,
        }),
        "organization.active": () => ({ id: "org_acme" }),
        "apiKeys.list": () => [],
        "superadmin.organizations.list": () => [],
    },
};

const signedOut: World = { session: null, handlers: {} };

export const worlds = { acme, signedOut };

export type WorldName = keyof typeof worlds;
