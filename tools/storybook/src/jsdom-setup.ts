import { vi } from "vitest";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

if (typeof window.matchMedia !== "function") {
    window.matchMedia = (query: string): MediaQueryList =>
        ({
            matches: false,
            media: query,
            onchange: null,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            addListener: vi.fn(),
            removeListener: vi.fn(),
            dispatchEvent: vi.fn(() => false),
        }) as MediaQueryList;
}

if (typeof ResizeObserver === "undefined") {
    Object.assign(globalThis, {
        ResizeObserver: class ResizeObserver {
            observe() {}
            unobserve() {}
            disconnect() {}
        },
    });
}

if (typeof IntersectionObserver === "undefined") {
    Object.assign(globalThis, {
        IntersectionObserver: class IntersectionObserver {
            root = null;
            rootMargin = "0px";
            thresholds = [0];
            observe() {}
            unobserve() {}
            disconnect() {}
            takeRecords() {
                return [];
            }
        },
    });
}

if (typeof Element.prototype.scrollIntoView !== "function") {
    Element.prototype.scrollIntoView = vi.fn();
}

if (typeof Element.prototype.getAnimations !== "function") {
    Element.prototype.getAnimations = () => [];
}
