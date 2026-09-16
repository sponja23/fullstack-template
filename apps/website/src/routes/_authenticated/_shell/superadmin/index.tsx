import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_shell/superadmin/")({
    beforeLoad: () => {
        throw redirect({ to: "/superadmin/organizations" });
    },
});
