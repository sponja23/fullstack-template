import {
    type SuperadminRouterBuilder,
    type SuperadminRouterContext,
} from "../../trpc/superadmin.procedures.ts";
import type { OrganizationDirectoryRepository } from "./organization-directory.repository.ts";

export interface SuperadminUserRouterDeps extends SuperadminRouterContext {
    organizationDirectoryRepository: OrganizationDirectoryRepository;
}

export const superadminUserRouter = ((deps: SuperadminUserRouterDeps) => {
    const { router, superadminProcedure, organizationDirectoryRepository } = deps;
    return router({
        me: superadminProcedure.query(({ ctx: { session } }) => ({
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
        })),
        organizations: router({
            list: superadminProcedure.query(() =>
                organizationDirectoryRepository.listOrganizationsWithMembers(),
            ),
        }),
    });
}) satisfies SuperadminRouterBuilder<SuperadminUserRouterDeps>;
