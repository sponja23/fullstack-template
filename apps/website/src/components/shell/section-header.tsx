import type { ReactNode } from "react";

export function SectionHeader({ children }: { children: ReactNode }) {
    return (
        <div className="flex flex-col gap-1 border-b border-sidebar-border px-3 py-3 group-data-[collapsible=icon]:hidden">
            {children}
        </div>
    );
}
