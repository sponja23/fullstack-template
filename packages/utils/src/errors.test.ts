import { describe, expect, it } from "vitest";
import { errMessage } from "./errors.ts";

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
