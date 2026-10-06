import { describe, expect, it } from "vitest";
import { errMessage, UnreachableError } from "./errors.ts";

describe("errMessage", () => {
    it("returns an Error's own message", () => {
        expect(errMessage(new Error("boom"))).toBe("boom");
    });

    it("stringifies non-Error values", () => {
        expect(errMessage("value")).toBe("value");
        expect(errMessage(42)).toBe("42");
        expect(errMessage(undefined)).toBe("undefined");
    });
});

describe("UnreachableError", () => {
    it("carries the value its switch did not handle", () => {
        const error = new UnreachableError({ kind: "unknown" } as never);
        expect(error).toBeInstanceOf(UnreachableError);
        expect(error.name).toBe("UnreachableError");
        expect(error.value).toEqual({ kind: "unknown" });
    });

    it("still constructs when its value is one JSON cannot encode", () => {
        const circular: { self?: unknown } = {};
        circular.self = circular;
        expect(new UnreachableError(circular as never).value).toBe(circular);
    });
});
