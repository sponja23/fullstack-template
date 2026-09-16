import type { ReactNode } from "react";

export function SettingsPage({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: ReactNode;
}) {
    return (
        <div className="mx-auto w-full max-w-4xl space-y-6 p-6 md:p-10">
            <header>
                <p className="text-sm text-muted-foreground">Organization settings</p>
                <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
                <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            </header>
            {children}
        </div>
    );
}
