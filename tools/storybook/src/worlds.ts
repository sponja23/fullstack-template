import { defaultFakeSession, type FakeSession } from "./fake-auth";
import type { FakeTRPCHandlers } from "./fake-trpc";
import type { UserAppRouter } from "@repo/client";
import type { inferRouterOutputs } from "@trpc/server";

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

type Outputs = inferRouterOutputs<UserAppRouter>;
const clients = [
    {
        id: "10000000-0000-4000-8000-000000000001",
        organizationId: organization.id,
        name: "Globex",
        billingEmail: "billing@globex.test",
        currency: "USD" as const,
        status: "active" as const,
        createdAt: EPOCH,
        updatedAt: EPOCH,
    },
    {
        id: "10000000-0000-4000-8000-000000000002",
        organizationId: organization.id,
        name: "Maison Violette",
        billingEmail: "finance@violette.test",
        currency: "EUR" as const,
        status: "active" as const,
        createdAt: EPOCH,
        updatedAt: EPOCH,
    },
    {
        id: "10000000-0000-4000-8000-000000000003",
        organizationId: organization.id,
        name: "Old Harbor",
        billingEmail: "accounts@oldharbor.test",
        currency: "USD" as const,
        status: "archived" as const,
        createdAt: EPOCH,
        updatedAt: EPOCH,
    },
] satisfies Outputs["clients"]["list"];

const projects = [
    {
        id: "20000000-0000-4000-8000-000000000001",
        organizationId: organization.id,
        clientId: clients[0].id,
        name: "Brand refresh",
        slug: "brand-refresh",
        rateMinor: 15_000,
        status: "active" as const,
        createdAt: EPOCH,
        updatedAt: EPOCH,
        clientName: clients[0].name,
        currency: clients[0].currency,
    },
    {
        id: "20000000-0000-4000-8000-000000000002",
        organizationId: organization.id,
        clientId: clients[0].id,
        name: "Analytics",
        slug: "analytics",
        rateMinor: 18_000,
        status: "active" as const,
        createdAt: EPOCH,
        updatedAt: EPOCH,
        clientName: clients[0].name,
        currency: clients[0].currency,
    },
    {
        id: "20000000-0000-4000-8000-000000000003",
        organizationId: organization.id,
        clientId: clients[1].id,
        name: "Storefront",
        slug: "storefront",
        rateMinor: 12_500,
        status: "active" as const,
        createdAt: EPOCH,
        updatedAt: EPOCH,
        clientName: clients[1].name,
        currency: clients[1].currency,
    },
    {
        id: "20000000-0000-4000-8000-000000000004",
        organizationId: organization.id,
        clientId: clients[2].id,
        name: "Legacy support",
        slug: "legacy-support",
        rateMinor: 10_000,
        status: "archived" as const,
        createdAt: EPOCH,
        updatedAt: EPOCH,
        clientName: clients[2].name,
        currency: clients[2].currency,
    },
] satisfies Outputs["projects"]["list"];

function isoDate(offset: number): string {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

const entries = [
    {
        id: "30000000-0000-4000-8000-000000000001",
        organizationId: organization.id,
        projectId: projects[0].id,
        authorId: owner.id,
        date: isoDate(0),
        minutes: 90,
        note: "Homepage concepts",
        lineItemId: null,
        createdAt: EPOCH,
        updatedAt: EPOCH,
        projectName: projects[0].name,
        projectSlug: projects[0].slug,
        clientName: projects[0].clientName,
        authorName: owner.user.name,
    },
    {
        id: "30000000-0000-4000-8000-000000000002",
        organizationId: organization.id,
        projectId: projects[0].id,
        authorId: member.id,
        date: isoDate(-1),
        minutes: 120,
        note: "Research",
        lineItemId: "line_billed",
        createdAt: EPOCH,
        updatedAt: EPOCH,
        projectName: projects[0].name,
        projectSlug: projects[0].slug,
        clientName: projects[0].clientName,
        authorName: member.user.name,
    },
] satisfies Outputs["timeEntries"]["listMine"];

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
        "clients.list": () => clients,
        "clients.get": (input) =>
            clients.find((client) => client.id === (input as { id: string }).id) ?? clients[0],
        "projects.list": (input) => {
            const clientId = (input as { clientId?: string } | undefined)?.clientId;
            return clientId
                ? projects.filter((project) => project.clientId === clientId)
                : projects;
        },
        "projects.get": (input) =>
            projects.find((project) => project.slug === (input as { slug: string }).slug) ??
            projects[0],
        "timeEntries.listForProject": (input) =>
            entries.filter(
                (entry) => entry.projectId === (input as { projectId: string }).projectId,
            ),
        "timeEntries.listMine": () => entries.filter((entry) => entry.authorId === owner.id),
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
        "clients.list": () => [],
        "projects.list": () => [],
        "timeEntries.listMine": () => [],
        "apiKeys.list": () => ({ apiKeys: [] }),
        "superadmin.organizations.list": () => [],
    },
};

const signedOut: World = { session: null, handlers: {} };

export const worlds = { acmeAgency, emptyOrg, signedOut };
export type WorldName = keyof typeof worlds;
