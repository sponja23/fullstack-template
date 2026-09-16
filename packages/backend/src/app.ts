import type { Auth } from "./auth/factory.ts";
import type { Database } from "./db/factory.ts";
import {
    clientNameUnique,
    invoiceNumberUnique,
    lineItemQuantityPositive,
    projectRateNonnegative,
    projectSlugUnique,
    timeEntryMinutesPositive,
} from "./db/schema/index.ts";
import { BadRequestError } from "./errors/base.ts";
import type { ConstraintViolationRegistry } from "./errors/constraint-violation.ts";
import { apiKeyUserRouter } from "./routes/api-key/api-key.user.router.ts";
import { ClientRepository } from "./routes/client/client.repository.ts";
import { ClientService } from "./routes/client/client.service.ts";
import { clientUserRouter } from "./routes/client/client.user.router.ts";
import {
    ClientNameTakenError,
    ProjectSlugTakenError,
} from "./routes/invoicing/invoicing.errors.ts";
import { InvoiceRepository } from "./routes/invoice/invoice.repository.ts";
import { InvoiceService } from "./routes/invoice/invoice.service.ts";
import { invoiceUserRouter } from "./routes/invoice/invoice.user.router.ts";
import { ProjectRepository } from "./routes/project/project.repository.ts";
import { ProjectService } from "./routes/project/project.service.ts";
import { projectUserRouter } from "./routes/project/project.user.router.ts";
import { OrganizationDirectoryRepository } from "./routes/superadmin/organization-directory.repository.ts";
import { superadminUserRouter } from "./routes/superadmin/superadmin.user.router.ts";
import { TimeEntryRepository } from "./routes/time-entry/time-entry.repository.ts";
import { TimeEntryService } from "./routes/time-entry/time-entry.service.ts";
import { timeEntryUserRouter } from "./routes/time-entry/time-entry.user.router.ts";
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
    return {
        [clientNameUnique]: () => new ClientNameTakenError(),
        [projectSlugUnique]: () => new ProjectSlugTakenError(),
        [projectRateNonnegative]: () => new BadRequestError("Hourly rate cannot be negative"),
        [timeEntryMinutesPositive]: () => new BadRequestError("Minutes must be positive"),
        [invoiceNumberUnique]: () => new BadRequestError("Invoice number is already in use"),
        [lineItemQuantityPositive]: () =>
            new BadRequestError("Line item quantity must be positive"),
    };
}

/** Composes the backend graph and returns routers, context, and caller factories. */
export function buildApp({ db, auth }: AppDeps) {
    const { t, router, baseProcedure } = buildTrpc(buildConstraintViolationRegistry());
    const { authProcedure, orgProcedure } = buildUserProcedures(baseProcedure);
    const { superadminProcedure } = buildSuperadminProcedures(baseProcedure);
    const organizationDirectoryRepository = new OrganizationDirectoryRepository(db);
    const clientRepository = new ClientRepository(db);
    const projectRepository = new ProjectRepository(db);
    const timeEntryRepository = new TimeEntryRepository(db);
    const invoiceRepository = new InvoiceRepository(db);
    const clientService = new ClientService(clientRepository);
    const projectService = new ProjectService(projectRepository, clientRepository);
    const timeEntryService = new TimeEntryService(timeEntryRepository, projectRepository);
    const invoiceService = new InvoiceService(invoiceRepository, clientRepository);

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
        clients: clientUserRouter({ ...userContext, clientService }),
        projects: projectUserRouter({ ...userContext, projectService }),
        timeEntries: timeEntryUserRouter({ ...userContext, timeEntryService }),
        invoices: invoiceUserRouter({ ...userContext, invoiceService }),
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
        services: { clients: clientService, invoices: invoiceService },
    };
}

export type App = ReturnType<typeof buildApp>;
export type UserAppRouter = App["userRouter"];
export type UserCaller = ReturnType<App["createUserCaller"]>;
