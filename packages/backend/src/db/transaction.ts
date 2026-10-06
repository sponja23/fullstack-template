import { logger } from "@repo/logger";
import { InternalServerError } from "../errors/base.ts";
import type { Database, Transaction } from "./factory.ts";

/** An after-commit effect was registered once its transaction had already settled. */
export class TransactionInvariantError extends InternalServerError {
    readonly errorCode = "TRANSACTION_INVARIANT_VIOLATION" as const;
    constructor() {
        super("afterCommit called on a settled transaction");
    }
}

/** The transaction committed, but at least one of its after-commit effects failed. */
export class AfterCommitEffectError extends InternalServerError {
    readonly errorCode = "AFTER_COMMIT_EFFECT_FAILED" as const;
    constructor(readonly failures: readonly unknown[]) {
        super(`${failures.length} after-commit effect(s) failed`, { cause: failures[0] });
    }
}

export type AfterCommitEffect = () => Promise<void>;

/** One open transaction as services hand it to each other; repositories receive only `tx`. */
export interface TxScope {
    readonly tx: Transaction;
    /** Registers `effect` to run after the commit; a rolled-back transaction runs none. */
    afterCommit(effect: AfterCommitEffect): void;
}

export class TransactionRunner {
    private readonly log = logger.child({ name: "TransactionRunner" });

    constructor(private readonly db: Database) {}

    /** Runs `work` in a new top-level transaction, then every effect it registered in order, even when an earlier one fails. */
    async run<T>(work: (scope: TxScope) => Promise<T>): Promise<T> {
        const effects: AfterCommitEffect[] = [];
        let open = true;
        const result = await this.db
            .transaction((tx) =>
                work({
                    tx,
                    afterCommit: (effect) => {
                        if (!open) throw new TransactionInvariantError();
                        effects.push(effect);
                    },
                }),
            )
            .finally(() => {
                open = false;
            });
        const failures: unknown[] = [];
        for (const effect of effects) {
            try {
                await effect();
            } catch (error) {
                this.log.warn("after-commit effect failed", error);
                failures.push(error);
            }
        }
        if (failures.length > 0) throw new AfterCommitEffectError(failures);
        return result;
    }
}
