import type { ReactNode } from "react";
import { cn } from "@repo/ui/utils";

export function CenteredContainer({
    className,
    children,
}: {
    className?: string;
    children: ReactNode;
}) {
    return <div className={cn("mx-auto w-full max-w-md space-y-6 p-6", className)}>{children}</div>;
}
