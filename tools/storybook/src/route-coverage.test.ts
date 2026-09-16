import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const routesRoot = join(process.cwd(), "..", "..", "apps", "website", "src", "routes");

function routeFiles(dir: string): string[] {
    const files: string[] = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (entry.name.startsWith("-")) continue;
        const full = join(dir, entry.name);
        if (entry.isDirectory()) files.push(...routeFiles(full));
        else if (entry.name.endsWith(".tsx")) files.push(relative(routesRoot, full));
    }
    return files;
}

function isPageRoute(path: string): boolean {
    if (path.endsWith(".stories.tsx")) return false;
    const base = path.split("/").at(-1);
    if (base === "__root.tsx" || base === "route.tsx") return false;
    return /(^|[^A-Za-z])component:/.test(readFileSync(join(routesRoot, path), "utf8"));
}

const routesExist = existsSync(routesRoot);
const pageRoutes = routesExist ? routeFiles(routesRoot).filter(isPageRoute) : [];

describe.skipIf(!routesExist)("every website page route has a colocated story", () => {
    it("finds page routes", () => {
        expect(pageRoutes.length).toBeGreaterThan(0);
    });

    it.each(pageRoutes)("%s has a sibling story", (path) => {
        const storyPath = join(routesRoot, path.replace(/\.tsx$/, ".stories.tsx"));
        expect(existsSync(storyPath), `${path} has no sibling story at ${storyPath}`).toBe(true);
    });
});
