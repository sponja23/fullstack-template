import type { Auth } from "./auth/factory.ts";
import type { Database } from "./db/factory.ts";
import type { ConstraintViolationRegistry } from "./errors/constraint-violation.ts";
import { apiKeyUserRouter } from "./routes/api-key/api-key.user.router.ts";
import { OrganizationDirectoryRepository } from "./routes/superadmin/organization-directory.repository.ts";
import { superadminUserRouter } from "./routes/superadmin/superadmin.user.router.ts";
import type { AppContext, CreateContextInput } from "./trpc/context.ts";
import { buildTrpc } from "./trpc/init.ts";
import {
    buildSuperadminProcedures,
    type SuperadminRouterContext,
} from "./trpc/superadmin.procedures.ts";
import { buildUserProcedures, type UserRouterContext } from "./trpc/user.procedures.ts";

export interface AppDeps {
    db: Database;
    auth: Auth;
}

export function buildConstraintViolationRegistry(): ConstraintViolationRegistry {
    return {};
}

/** Composes the backend graph and returns routers, context, and caller factories. */
export function buildApp({ db, auth }: AppDeps) {
    const { t, router, baseProcedure } = buildTrpc(buildConstraintViolationRegistry());
    const { authProcedure, orgProcedure } = buildUserProcedures(baseProcedure);
    const { superadminProcedure } = buildSuperadminProcedures(baseProcedure);
    const organizationDirectoryRepository = new OrganizationDirectoryRepository(db);

    const userContext: UserRouterContext = { router, authProcedure, orgProcedure };
    const superadminContext: SuperadminRouterContext = { router, superadminProcedure };
    const userRouter = router({
        me: authProcedure.query(({ ctx: { session } }) => ({
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
        })),
        organization: router({
            active: orgProcedure.query(({ ctx: { session } }) => ({
                id: session.organizationId,
            })),
        }),
        apiKeys: apiKeyUserRouter(userContext),
        superadmin: superadminUserRouter({
            ...superadminContext,
            organizationDirectoryRepository,
        }),
    });

    const createContext = ({ headers }: CreateContextInput): AppContext => ({ auth, headers });
    return {
        userRouter,
        createContext,
        createUserCaller: t.createCallerFactory(userRouter),
    };
}

export type App = ReturnType<typeof buildApp>;
export type UserAppRouter = App["userRouter"];
export type UserCaller = ReturnType<App["createUserCaller"]>;
