import type { QueryClient } from "@tanstack/react-query";

export interface FakeSession {
    user: {
        id: string;
        name: string;
        email: string;
        emailVerified: boolean;
        image: string | null;
        role: string | null;
        createdAt: Date;
        updatedAt: Date;
    };
    session: {
        id: string;
        userId: string;
        activeOrganizationId: string | null;
        expiresAt: Date;
        createdAt: Date;
        updatedAt: Date;
        token: string;
    };
}

const SESSION_QUERY_KEY = ["auth", "session"] as const;
const EPOCH = new Date("2026-01-01T00:00:00Z");

export const defaultFakeSession: FakeSession = {
    user: {
        id: "user_story",
        name: "Story User",
        email: "story@acme.test",
        emailVerified: true,
        image: null,
        role: "superadmin",
        createdAt: EPOCH,
        updatedAt: EPOCH,
    },
    session: {
        id: "session_story",
        userId: "user_story",
        activeOrganizationId: "org_acme",
        expiresAt: new Date("2030-01-01T00:00:00Z"),
        createdAt: EPOCH,
        updatedAt: EPOCH,
        token: "story-session-token",
    },
};

/** Seeds the auth query with a non-expiring fixture so no story contacts an auth backend. */
export function seedSession(queryClient: QueryClient, session: FakeSession | null): void {
    queryClient.setQueryDefaults(SESSION_QUERY_KEY, { staleTime: Infinity, gcTime: Infinity });
    queryClient.setQueryData(SESSION_QUERY_KEY, session);
}
