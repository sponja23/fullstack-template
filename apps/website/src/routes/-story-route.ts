import type { AnyRoute } from "@tanstack/react-router";
import { routeTree, type FileRoutesById } from "@/routeTree.gen";

export function storyRoute<TId extends keyof FileRoutesById>(id: TId): FileRoutesById[TId] {
    let originalIndex = 0;
    // File-route IDs and parent links exist only after the generated tree has been initialized.
    const route = findRoute(routeTree, id, () => originalIndex++);
    if (route === undefined) throw new Error(`Story route ${id} was not found`);
    return route as FileRoutesById[TId];
}

function findRoute(route: AnyRoute, id: string, nextIndex: () => number): AnyRoute | undefined {
    if (route.id === undefined) route.init({ originalIndex: nextIndex() });
    if (route.id === id) return route;
    const children: unknown = route.children;
    if (!Array.isArray(children)) return undefined;
    for (const child of children) {
        if (!isRouteNode(child)) continue;
        const found = findRoute(child, id, nextIndex);
        if (found !== undefined) return found;
    }
    return undefined;
}

function isRouteNode(value: unknown): value is AnyRoute {
    return typeof value === "object" && value !== null && "init" in value;
}
