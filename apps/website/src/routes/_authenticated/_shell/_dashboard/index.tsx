import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_shell/_dashboard/")({
    beforeLoad: () => {
        throw redirect({ to: "/clients" });
    },
});
