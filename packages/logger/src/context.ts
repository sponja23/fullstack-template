import { AsyncLocalStorage } from "node:async_hooks";

export type Attrs = Record<string, unknown>;

const tagStore = new AsyncLocalStorage<Attrs>();

export function currentTags(): Attrs | undefined {
    return tagStore.getStore();
}

export function withTags<T>(tags: Attrs, fn: () => T): T {
    return tagStore.run({ ...tagStore.getStore(), ...tags }, fn);
}
