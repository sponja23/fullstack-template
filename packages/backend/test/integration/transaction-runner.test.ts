import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { expect } from "vitest";
import { client } from "../../src/db/schema/index.ts";
import {
    AfterCommitEffectError,
    TransactionInvariantError,
    TransactionRunner,
    type Transaction,
    type TxScope,
} from "../../src/db/transaction.ts";
import type { TestHarness } from "../harness.ts";
import { apiTestSuite } from "../suite.ts";

function insertClient(harness: TestHarness, tx: Transaction, id: string) {
    return tx.insert(client).values({
        id,
        organizationId: harness.organizationId,
        name: `Client ${id}`,
        billingEmail: "billing@example.test",
        currency: "USD",
    });
}

async function clientExists(harness: TestHarness, id: string) {
    const rows = await harness.db.select().from(client).where(eq(client.id, id));
    return rows.length > 0;
}

apiTestSuite({
    name: "transaction runner",
    cases: (test) => {
        test("a committed run runs its effects in order, after the commit, before resolving", async ({
            harness,
        }) => {
            const transactions = new TransactionRunner(harness.db);
            const id = randomUUID();
            const order: string[] = [];

            const result = await transactions.run(async (scope) => {
                await insertClient(harness, scope.tx, id);
                scope.afterCommit(async () => {
                    order.push(`first saw the row: ${await clientExists(harness, id)}`);
                });
                scope.afterCommit(async () => {
                    order.push("second");
                });
                order.push("work");
                return "done";
            });

            expect(result).toBe("done");
            expect(order).toEqual(["work", "first saw the row: true", "second"]);
        });

        test("a rolled-back run commits nothing and runs none of its effects", async ({
            harness,
        }) => {
            const transactions = new TransactionRunner(harness.db);
            const id = randomUUID();
            const ran: string[] = [];
            const failure = new Error("work failed");

            await expect(
                transactions.run(async (scope) => {
                    await insertClient(harness, scope.tx, id);
                    scope.afterCommit(async () => {
                        ran.push("effect");
                    });
                    throw failure;
                }),
            ).rejects.toBe(failure);

            expect(ran).toEqual([]);
            expect(await clientExists(harness, id)).toBe(false);
        });

        test("a failing effect does not stop later ones, and the run rejects with the first as cause", async ({
            harness,
        }) => {
            const transactions = new TransactionRunner(harness.db);
            const id = randomUUID();
            const first = new Error("first effect failed");
            const ran: string[] = [];

            const run = transactions.run(async (scope) => {
                await insertClient(harness, scope.tx, id);
                scope.afterCommit(async () => {
                    throw first;
                });
                scope.afterCommit(async () => {
                    ran.push("second");
                });
                scope.afterCommit(async () => {
                    throw new Error("third effect failed");
                });
            });

            await expect(run).rejects.toBeInstanceOf(AfterCommitEffectError);
            await expect(run).rejects.toMatchObject({ failedEffects: 2, cause: first });
            expect(ran).toEqual(["second"]);
            expect(await clientExists(harness, id)).toBe(true);
        });

        test("registering an effect on a settled transaction throws", async ({ harness }) => {
            const transactions = new TransactionRunner(harness.db);
            let settled: TxScope | undefined;
            await transactions.run(async (scope) => {
                settled = scope;
            });

            expect(() => settled?.afterCommit(async () => {})).toThrow(TransactionInvariantError);
        });

        test("a nested run commits on its own, whatever the outer transaction does", async ({
            harness,
        }) => {
            const transactions = new TransactionRunner(harness.db);
            const id = randomUUID();
            const outerFailure = new Error("outer failed");

            await expect(
                transactions.run(async () => {
                    await transactions.run(({ tx }) => insertClient(harness, tx, id));
                    throw outerFailure;
                }),
            ).rejects.toBe(outerFailure);

            expect(await clientExists(harness, id)).toBe(true);
        });
    },
});
