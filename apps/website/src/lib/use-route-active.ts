import { useLinkProps } from "@tanstack/react-router";
import type {
    RegisteredRouter,
    UseLinkPropsOptions,
    ValidateLinkOptions,
} from "@tanstack/react-router";

export function useRouteActive<TRouter extends RegisteredRouter, TOptions>(
    options: ValidateLinkOptions<TRouter, TOptions>,
): boolean;
export function useRouteActive(options: UseLinkPropsOptions): boolean {
    const { "data-status": status } = useLinkProps(options) as { "data-status"?: string };
    return status === "active";
}
