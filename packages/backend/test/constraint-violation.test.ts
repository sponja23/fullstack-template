import { describe, expect, it } from "vitest";
import { pgConstraintViolation } from "../src/errors/constraint-violation.ts";

describe("pgConstraintViolation", () => {
    it("finds supported Postgres violations through wrapped causes", () => {
        expect(
            pgConstraintViolation({ cause: { code: "23505", constraint: "client_name_unique" } }),
        ).toBe("client_name_unique");
    });

    it("ignores unsupported errors", () => {
        expect(
            pgConstraintViolation({ code: "22001", constraint: "value_length" }),
        ).toBeUndefined();
    });
});
