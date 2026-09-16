import {
    Link,
    Outlet,
    createRootRouteWithContext,
    useMatches,
    useNavigate,
} from "@tanstack/react-router";
import { Button, buttonVariants } from "@repo/ui/button";
import { useAuth, useSignOut } from "@/lib/queries/auth.queries";
import type { RouterContext } from "@/router";

export const Route = createRootRouteWithContext<RouterContext>()({ component: RootLayout });

function RootLayout() {
    const inShell = useMatches({
        select: (matches) =>
            matches.some((match) => match.routeId.startsWith("/_authenticated/_shell")),
    });
    if (inShell)
        return (
            <div className="h-dvh bg-background text-foreground">
                <Outlet />
            </div>
        );
    return (
        <div className="flex h-dvh flex-col bg-background text-foreground">
            <PublicHeader />
            <main className="min-h-0 flex-1 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}

function PublicHeader() {
    const { isLoggedIn } = useAuth();
    const signOut = useSignOut();
    const navigate = useNavigate();
    return (
        <header className="border-b">
            <nav className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
                <Link to="/" className="font-semibold">
                    Acme
                </Link>
                <div className="ml-auto flex items-center gap-2">
                    {isLoggedIn ? (
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={signOut.isPending}
                            onClick={async () => {
                                await navigate({ to: "/login" });
                                await signOut.mutateAsync();
                            }}
                        >
                            {signOut.isPending ? "Signing out…" : "Sign out"}
                        </Button>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className={buttonVariants({ variant: "ghost", size: "sm" })}
                            >
                                Log in
                            </Link>
                            <Link to="/signup" className={buttonVariants({ size: "sm" })}>
                                Sign up
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
}
