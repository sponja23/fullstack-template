import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const uiRoot = join(process.cwd(), "..", "..", "packages", "ui");
const packageJson = JSON.parse(readFileSync(join(uiRoot, "package.json"), "utf8")) as {
    exports: Record<string, string>;
};
const componentExports = Object.entries(packageJson.exports).filter(([, target]) =>
    target.startsWith("./src/components/ui/"),
);
const storyFor = (target: string) => target.replace(/\.tsx?$/, ".stories.tsx");

describe("every @repo/ui primitive has a colocated story", () => {
    it("finds component exports", () => {
        expect(componentExports.length).toBeGreaterThan(0);
    });

    it.each(componentExports)("%s has a sibling story", (subpath, target) => {
        const storyPath = join(uiRoot, storyFor(target));
        expect(existsSync(storyPath), `${subpath} has no sibling story at ${storyPath}`).toBe(true);
    });
});
