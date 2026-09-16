import { afterAll, beforeAll, describe, test } from "vitest";
import type { UserCaller } from "../src/app.ts";
import { TestHarness, type HarnessSubstitutes } from "./harness.ts";

export interface CaseContext {
    harness: TestHarness;
    request: UserCaller;
}

export interface ApiTestSuiteOptions extends HarnessSubstitutes {
    name: string;
    cases: (
        testCase: (name: string, fn: (ctx: CaseContext) => Promise<void> | void) => void,
    ) => void;
}

export function apiTestSuite(options: ApiTestSuiteOptions): void {
    describe(options.name, () => {
        let harness: TestHarness;
        beforeAll(async () => {
            harness = await TestHarness.create(options);
        });
        afterAll(async () => {
            await harness?.cleanup();
        });
        options.cases((name, fn) => test(name, () => fn({ harness, request: harness.request })));
    });
}
