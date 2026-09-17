import type { ReactNode } from "react";
import { cn } from "@repo/ui/utils";

export function CenteredScreen({
    className,
    children,
}: {
    className?: string;
    children: ReactNode;
}) {
    return (
        <div className={cn("flex min-h-full flex-col justify-center", className)}>{children}</div>
    );
}
