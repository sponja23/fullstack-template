import { expect } from "vitest";
import { apiTestSuite } from "../suite.ts";

apiTestSuite({
    name: "project service",
    cases: (test) => {
        test("creates, updates, and archives projects", async ({ request }) => {
            const client = await request.clients.create({
                name: "Project client",
                billingEmail: "projects@example.test",
                currency: "EUR",
            });
            const project = await request.projects.create({
                clientId: client.id,
                name: "Launch",
                slug: "launch",
                rateMinor: 12_500,
            });
            const updated = await request.projects.update({
                id: project.id,
                name: "Launch two",
                slug: "launch-two",
                rateMinor: 15_000,
            });
            expect(updated).toMatchObject({ currency: "EUR", slug: "launch-two" });
            await expect(request.projects.archive({ id: project.id })).resolves.toMatchObject({
                status: "archived",
            });
        });

        test("maps duplicate slugs and missing projects to domain errors", async ({ request }) => {
            const client = await request.clients.create({
                name: "Slug client",
                billingEmail: "slug@example.test",
                currency: "USD",
            });
            await request.projects.create({
                clientId: client.id,
                name: "First",
                slug: "same-slug",
                rateMinor: 1,
            });
            await expect(
                request.projects.create({
                    clientId: client.id,
                    name: "Second",
                    slug: "same-slug",
                    rateMinor: 2,
                }),
            ).rejects.toMatchObject({ cause: { errorCode: "PROJECT_SLUG_TAKEN" } });
            await expect(request.projects.get({ slug: "missing" })).rejects.toMatchObject({
                cause: { errorCode: "PROJECT_NOT_FOUND" },
            });
        });

        test("isolates project reads and writes by organization", async ({ harness, request }) => {
            const client = await request.clients.create({
                name: "Private project client",
                billingEmail: "private-project@example.test",
                currency: "USD",
            });
            const project = await request.projects.create({
                clientId: client.id,
                name: "Private project",
                slug: "private-project",
                rateMinor: 9_000,
            });
            const outsider = await harness.signUpUser();
            await harness.createOrganization(
                outsider.cookieHeader,
                `outsider-project-${Date.now()}`,
            );
            await expect(outsider.request.projects.list()).resolves.toEqual([]);
            await expect(
                outsider.request.projects.archive({ id: project.id }),
            ).rejects.toMatchObject({ cause: { errorCode: "PROJECT_NOT_FOUND" } });
        });
    },
});
