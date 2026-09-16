import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

if (["0", "false"].includes(process.env.RUN_BROWSER_TESTS ?? "")) {
    console.log("browser-smoke: skipped (RUN_BROWSER_TESTS is off)");
    process.exit(0);
}

const staticDir = fileURLToPath(new URL("./dist", import.meta.url));
if (!existsSync(join(staticDir, "index.json"))) {
    const built = spawnSync("pnpm", ["run", "build"], { stdio: "inherit" });
    if (built.status !== 0) process.exit(built.status ?? 1);
}

const contentTypes = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".mjs": "text/javascript",
    ".json": "application/json",
    ".css": "text/css",
    ".woff2": "font/woff2",
    ".svg": "image/svg+xml",
};

const server = createServer(async (request, response) => {
    const requestPath = normalize(decodeURIComponent((request.url ?? "/").split("?")[0]));
    const file = join(staticDir, requestPath === "/" ? "index.html" : requestPath);
    if (!file.startsWith(`${staticDir}/`) && file !== join(staticDir, "index.html")) {
        response.writeHead(403).end();
        return;
    }
    try {
        const body = await readFile(file);
        response.writeHead(200, {
            "content-type": contentTypes[extname(file)] ?? "application/octet-stream",
        });
        response.end(body);
    } catch {
        response.writeHead(404).end();
    }
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const address = server.address();
if (address === null || typeof address === "string") throw new Error("storybook server failed");

const index = JSON.parse(await readFile(join(staticDir, "index.json"), "utf8"));
const storyIds = Object.values(index.entries)
    .filter((entry) => entry.type === "story")
    .map((entry) => entry.id);
const browser = await chromium.launch();
const failures = [];

for (const id of storyIds) {
    const page = await browser.newPage();
    const errors = [];
    try {
        await page.goto(`http://127.0.0.1:${address.port}/iframe.html?id=${id}&viewMode=story`, {
            waitUntil: "networkidle",
        });
        const state = await page.evaluate(() => {
            const root = document.querySelector("#storybook-root");
            const rootHasContent = !!root && root.children.length > 0;
            const portalHasContent = Array.from(document.body.children).some(
                (element) =>
                    element !== root &&
                    !["SCRIPT", "STYLE", "LINK", "TEMPLATE"].includes(element.tagName) &&
                    element.children.length > 0,
            );
            return {
                rendered: rootHasContent || portalHasContent,
                storybookError: document.body.classList.contains("sb-show-errordisplay"),
            };
        });
        if (!state.rendered) errors.push("rendered no content");
        if (state.storybookError) errors.push("Storybook displayed an error");
    } catch (error) {
        errors.push(String(error));
    }
    await page.close();
    console.log(`${errors.length === 0 ? "✓" : "✗"} ${id}`);
    if (errors.length > 0) failures.push({ id, errors });
}

await browser.close();
server.close();
for (const failure of failures) console.error(failure.id, failure.errors);
process.exit(failures.length === 0 ? 0 : 1);
