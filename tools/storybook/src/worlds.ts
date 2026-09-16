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

const EPOCH = new Date("2026-01-01T00:00:00Z");
const organization = {
    id: "org_acme",
    name: "Acme Agency",
    slug: "acme-agency",
    logo: null,
    metadata: null,
    createdAt: EPOCH,
};
const owner = {
    id: "member_owner",
    organizationId: organization.id,
    userId: defaultFakeSession.user.id,
    role: "owner",
    createdAt: EPOCH,
    user: {
        id: defaultFakeSession.user.id,
        name: defaultFakeSession.user.name,
        email: defaultFakeSession.user.email,
        image: null,
    },
};
const member = {
    id: "member_ada",
    organizationId: organization.id,
    userId: "user_ada",
    role: "member",
    createdAt: EPOCH,
    user: {
        id: "user_ada",
        name: "Ada Lovelace",
        email: "ada@acme.test",
        image: null,
    },
};

function queries(
    members: readonly unknown[],
    invitations: readonly unknown[],
): readonly SeededQuery[] {
    return [
        { queryKey: ["organizations", "list"], data: [organization] },
        { queryKey: ["organizations", "active", organization.id], data: organization },
        {
            queryKey: ["organizations", "members", organization.id],
            data: { members, total: members.length },
        },
        { queryKey: ["organizations", "invitations", organization.id], data: invitations },
        { queryKey: ["organizations", "userInvitations"], data: [] },
    ];
}

const acmeAgency: World = {
    session: defaultFakeSession,
    queries: queries(
        [owner, member],
        [
            {
                id: "invite_grace",
                email: "grace@acme.test",
                role: "admin",
                status: "pending",
                organizationId: organization.id,
                inviterId: defaultFakeSession.user.id,
                expiresAt: new Date("2030-01-01T00:00:00Z"),
                createdAt: EPOCH,
            },
        ],
    ),
    handlers: {
        me: () => defaultFakeSession.user,
        "organization.active": () => ({ id: organization.id }),
        "apiKeys.list": () => ({
            apiKeys: [
                {
                    id: "key_ci",
                    name: "CI",
                    start: "acme_12ab",
                    createdAt: EPOCH,
                    lastRequest: null,
                },
            ],
        }),
        "superadmin.organizations.list": () => [
            {
                ...organization,
                members: [
                    {
                        id: owner.id,
                        userId: owner.userId,
                        name: owner.user.name,
                        email: owner.user.email,
                        image: null,
                        role: owner.role,
                    },
                    {
                        id: member.id,
                        userId: member.userId,
                        name: member.user.name,
                        email: member.user.email,
                        image: null,
                        role: member.role,
                    },
                ],
            },
        ],
    },
};

const emptyOrg: World = {
    session: defaultFakeSession,
    queries: queries([owner], []),
    handlers: {
        me: () => defaultFakeSession.user,
        "organization.active": () => ({ id: organization.id }),
        "apiKeys.list": () => ({ apiKeys: [] }),
        "superadmin.organizations.list": () => [],
    },
};

const signedOut: World = { session: null, handlers: {} };

export const worlds = { acmeAgency, emptyOrg, signedOut };
export type WorldName = keyof typeof worlds;
