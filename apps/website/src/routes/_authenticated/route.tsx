import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { ensureSessionData } from "@/lib/queries/auth.queries";

export const Route = createFileRoute("/_authenticated")({
    beforeLoad: async ({ context, location }) => {
        const session = await ensureSessionData(context.queryClient);
        if (!session?.session) {
            throw redirect({ to: "/login", search: { redirect: location.href } });
        }
    },
    component: () => <Outlet />,
});
