import { count } from "drizzle-orm";
import { expect } from "vitest";
import { grantSuperadmin } from "../../src/auth/superadmin.ts";
import { member, organization } from "../../src/db/schema/index.ts";
import { FakeEmailSender } from "../fake-email-sender.ts";
import { cookieHeaderFromResponse } from "../harness.ts";
import { apiTestSuite } from "../suite.ts";

const emailSender = new FakeEmailSender();

apiTestSuite({
    name: "authenticated backend foundation",
    emailSender,
    cases: (test) => {
        test("signs up and creates the primary organization", async ({ harness, request }) => {
            await expect(request.me()).resolves.toMatchObject({ id: harness.userId });
            await expect(request.organization.active()).resolves.toEqual({
                id: harness.organizationId,
            });
        });

        test("delivers organization invitations through the email port", async ({ harness }) => {
            const invitee = await harness.signUpUser();
            const invitation = await harness.auth.api.createInvitation({
                body: {
                    email: invitee.email,
                    role: "member",
                    organizationId: harness.organizationId,
                },
                headers: harness.authHeaders(harness.cookieHeader),
            });
            expect(invitation.status).toBe("pending");
            expect(emailSender.sent).toContainEqual(
                expect.objectContaining({
                    to: invitee.email,
                    subject: expect.stringContaining(harness.organization.slug),
                    text: expect.stringContaining("/onboarding"),
                }),
            );
        });

        test("keeps a removed member's time visible and billable while revoking their session", async ({
            harness,
            request,
        }) => {
            const contributor = await harness.signUpUser();
            const membership = await harness.auth.api.addMember({
                body: {
                    userId: contributor.userId,
                    role: "member",
                    organizationId: harness.organizationId,
                },
                headers: harness.authHeaders(harness.cookieHeader),
            });
            await harness.auth.api.setActiveOrganization({
                body: { organizationId: harness.organizationId },
                headers: harness.authHeaders(contributor.cookieHeader),
            });
            const activeSession = await harness.auth.api.getSession({
                headers: harness.authHeaders(contributor.cookieHeader),
            });
            expect(activeSession?.session.activeOrganizationId).toBe(harness.organizationId);

            const client = await request.clients.create({
                name: "Former member client",
                billingEmail: "former-member@example.test",
                currency: "USD",
            });
            const project = await request.projects.create({
                clientId: client.id,
                name: "Former member project",
                slug: "former-member-project",
                rateMinor: 9_000,
            });
            const entry = await contributor.request.timeEntries.create({
                projectId: project.id,
                date: "2026-09-16",
                minutes: 60,
                note: "Work that outlives membership",
            });

            await expect(
                harness.auth.api.removeMember({
                    body: {
                        memberIdOrEmail: membership.id,
                        organizationId: harness.organizationId,
                    },
                    headers: harness.authHeaders(harness.cookieHeader),
                }),
            ).resolves.toMatchObject({ member: { id: membership.id } });
            await expect(
                harness.auth.api.getSession({
                    headers: harness.authHeaders(contributor.cookieHeader),
                }),
            ).resolves.toBeNull();

            await expect(
                request.timeEntries.listForProject({ projectId: project.id }),
            ).resolves.toContainEqual(
                expect.objectContaining({
                    id: entry.id,
                    authorId: contributor.userId,
                    authorName: activeSession?.user.name,
                    lineItemId: null,
                }),
            );
            const draft = await request.invoices.createDraft({ clientId: client.id });
            await expect(
                request.invoices.listUnbilledEntries({ invoiceId: draft.id }),
            ).resolves.toContainEqual(expect.objectContaining({ id: entry.id }));
            await request.invoices.addTimeLines({ invoiceId: draft.id, entryIds: [entry.id] });
            const issued = await request.invoices.issue({ id: draft.id });
            expect(issued.lineItems).toContainEqual(
                expect.objectContaining({ sourceEntryIds: [entry.id] }),
            );
            await expect(
                request.timeEntries.listForProject({ projectId: project.id }),
            ).resolves.toContainEqual(
                expect.objectContaining({
                    id: entry.id,
                    authorName: activeSession?.user.name,
                    lineItemId: expect.any(String),
                }),
            );
        });

        test("mints and verifies an organization API key", async ({ harness, request }) => {
            const issued = await request.apiKeys.issue({
                name: "integration",
                scopes: ["clients:read"],
            });
            const verified = await harness.auth.api.verifyApiKey({ body: { key: issued.key } });
            expect(verified.valid).toBe(true);
            expect(verified.key?.referenceId).toBe(harness.organizationId);
        });

        test("grants superadmin and impersonates another user", async ({ harness, request }) => {
            const target = await harness.signUpUser();
            await grantSuperadmin(harness.db, harness.user.email);
            await expect(request.superadmin.me()).resolves.toMatchObject({ id: harness.userId });

            const response = await harness.auth.api.impersonateUser({
                body: { userId: target.userId },
                headers: harness.authHeaders(harness.cookieHeader),
                asResponse: true,
            });
            const impersonatedCookie = cookieHeaderFromResponse(response);
            const session = await harness.auth.api.getSession({
                headers: harness.authHeaders(impersonatedCookie),
            });
            expect(session?.user.id).toBe(target.userId);
            expect(session?.session.impersonatedBy).toBe(harness.userId);
        });

        test("lists organizations through the read-only superadmin directory", async ({
            harness,
            request,
        }) => {
            await grantSuperadmin(harness.db, harness.user.email);
            const external = await harness.createExternalOrg();
            const [before] = await harness.db.select({ value: count() }).from(member);
            const listed = await request.superadmin.organizations.list();
            const [after] = await harness.db.select({ value: count() }).from(member);
            expect(
                listed.find((item) => item.id === external.organizationId)?.members,
            ).toContainEqual(expect.objectContaining({ userId: external.userId, role: "owner" }));
            expect(after.value).toBe(before.value);
            expect(listed.map((item) => item.id)).toContain(harness.organizationId);
            expect(await harness.db.select().from(organization)).toHaveLength(listed.length);
        });
    },
});
