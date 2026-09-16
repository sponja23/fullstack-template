import type { ErrorComponentProps } from "@tanstack/react-router";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/alert";
import { Skeleton } from "@repo/ui/skeleton";

export function RoutePending() {
    return (
        <div className="mx-auto w-full max-w-4xl space-y-4 p-6" aria-label="Loading page">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-32 w-full" />
        </div>
    );
}

export function RouteError({ error }: ErrorComponentProps) {
    return (
        <div className="mx-auto w-full max-w-4xl p-6">
            <Alert variant="destructive">
                <AlertTitle>Unable to load this page</AlertTitle>
                <AlertDescription>
                    {error instanceof Error ? error.message : "Please try again."}
                </AlertDescription>
            </Alert>
        </div>
    );
}
