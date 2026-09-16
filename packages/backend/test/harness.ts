import { randomBytes } from "node:crypto";
import type { Pool } from "pg";
import { type App, type UserCaller, buildApp } from "../src/app.ts";
import { type Auth, buildAuth } from "../src/auth/factory.ts";
import { type Database, buildDb } from "../src/db/factory.ts";
import type { EmailSender } from "../src/email/email-sender.ts";
import { closePool } from "./database.ts";
import { FakeEmailSender } from "./fake-email-sender.ts";
import { type DbProvisioner, provisionFromSharedTemplate } from "./provisioning.ts";

export { provisionStandalone } from "./provisioning.ts";
export type { ProvisionedDb } from "./provisioning.ts";
export { FakeEmailSender } from "./fake-email-sender.ts";

const TEST_HOST = "localhost";
export const PRIMARY_PASSWORD = "test-password-123";

export interface HarnessUser {
    id: string;
    email: string;
}

export interface HarnessOrganization {
    id: string;
    slug: string;
}

export interface SignedUpUser {
    userId: string;
    email: string;
    request: UserCaller;
    cookieHeader: string;
}

export interface PrimarySeed {
    user: HarnessUser;
    organization: HarnessOrganization;
    cookieHeader: string;
    request: UserCaller;
}

export interface HarnessSubstitutes {
    emailSender?: EmailSender;
}

interface HarnessParts {
    pool: Pool;
    db: Database;
    auth: Auth;
    app: App;
    emailSender: EmailSender;
    dbName: string;
    teardown: () => Promise<void>;
}

function rand(): string {
    return randomBytes(6).toString("hex");
}

/** Collapses repeated Set-Cookie names to the final value a browser would retain. */
export function cookieHeaderFromResponse(response: Response): string {
    const cookies = new Map<string, string>();
    for (const setCookie of response.headers.getSetCookie()) {
        const pair = setCookie.split(";", 1)[0];
        const separator = pair.indexOf("=");
        if (separator > 0) cookies.set(pair.slice(0, separator), pair);
    }
    return [...cookies.values()].join("; ");
}

async function assembleHarness(
    provisioner: DbProvisioner,
    substitutes: HarnessSubstitutes = {},
): Promise<HarnessParts> {
    const { connectionString, dbName, teardown } = await provisioner();
    const { db, pool } = buildDb({ connectionString });
    const emailSender = substitutes.emailSender ?? new FakeEmailSender();
    const auth = buildAuth({
        db,
        secret: "test-secret-not-cryptographically-relevant",
        webUrl: `http://${TEST_HOST}`,
        allowedHosts: [TEST_HOST],
        emailSender,
    });
    return {
        pool,
        db,
        auth,
        app: buildApp({ db, auth }),
        emailSender,
        dbName,
        teardown,
    };
}

async function signUpAndCaptureCookie(
    auth: Auth,
): Promise<{ cookieHeader: string; user: HarnessUser }> {
    const id = rand();
    const email = `user-${id}@test.local`;
    const response = await auth.api.signUpEmail({
        body: { email, password: PRIMARY_PASSWORD, name: `Test User ${id}` },
        headers: new Headers({ host: TEST_HOST, origin: `http://${TEST_HOST}` }),
        asResponse: true,
    });
    const cookieHeader = cookieHeaderFromResponse(response);
    if (!cookieHeader) throw new Error("Sign-up returned no session cookie");
    const session = await auth.api.getSession({
        headers: new Headers({
            host: TEST_HOST,
            origin: `http://${TEST_HOST}`,
            cookie: cookieHeader,
        }),
    });
    if (!session) throw new Error("Sign-up session could not be resolved");
    return { cookieHeader, user: { id: session.user.id, email: session.user.email } };
}

export class TestHarness {
    readonly pool: Pool;
    readonly db: Database;
    readonly auth: Auth;
    readonly app: App;
    readonly emailSender: EmailSender;
    readonly dbName: string;
    private readonly teardown: () => Promise<void>;
    private seed!: PrimarySeed;

    private constructor(parts: HarnessParts) {
        this.pool = parts.pool;
        this.db = parts.db;
        this.auth = parts.auth;
        this.app = parts.app;
        this.emailSender = parts.emailSender;
        this.dbName = parts.dbName;
        this.teardown = parts.teardown;
    }

    static async create(substitutes: HarnessSubstitutes = {}): Promise<TestHarness> {
        const harness = new TestHarness(
            await assembleHarness(provisionFromSharedTemplate, substitutes),
        );
        const signedUp = await harness.signUpUser();
        const slug = `primary-${rand()}`;
        const organizationId = await harness.createOrganization(signedUp.cookieHeader, slug);
        harness.seed = {
            user: { id: signedUp.userId, email: signedUp.email },
            organization: { id: organizationId, slug },
            cookieHeader: signedUp.cookieHeader,
            request: signedUp.request,
        };
        return harness;
    }

    get user(): HarnessUser {
        return this.seed.user;
    }
    get organization(): HarnessOrganization {
        return this.seed.organization;
    }
    get userId(): string {
        return this.seed.user.id;
    }
    get organizationId(): string {
        return this.seed.organization.id;
    }
    get cookieHeader(): string {
        return this.seed.cookieHeader;
    }
    get request(): UserCaller {
        return this.seed.request;
    }

    hostHeaders(extra: Record<string, string> = {}): Headers {
        return new Headers({ host: TEST_HOST, origin: `http://${TEST_HOST}`, ...extra });
    }

    authHeaders(cookieHeader: string): Headers {
        return this.hostHeaders({ cookie: cookieHeader });
    }

    userCaller(cookieHeader: string): UserCaller {
        return this.app.createUserCaller(
            this.app.createContext({ headers: this.authHeaders(cookieHeader) }),
        );
    }

    async signUpUser(): Promise<SignedUpUser> {
        const { cookieHeader, user } = await signUpAndCaptureCookie(this.auth);
        return {
            userId: user.id,
            email: user.email,
            request: this.userCaller(cookieHeader),
            cookieHeader,
        };
    }

    async createOrganization(cookieHeader: string, slug: string): Promise<string> {
        const created = await this.auth.api.createOrganization({
            body: { name: `Org ${slug}`, slug },
            headers: this.authHeaders(cookieHeader),
        });
        if (!created) throw new Error("Organization creation returned no organization");
        return created.id;
    }

    async createExternalOrg(): Promise<{ userId: string; organizationId: string }> {
        const signedUp = await this.signUpUser();
        const organizationId = await this.createOrganization(
            signedUp.cookieHeader,
            `external-${rand()}`,
        );
        return { userId: signedUp.userId, organizationId };
    }

    async cleanup(): Promise<void> {
        try {
            await closePool(this.pool);
        } finally {
            await this.teardown();
        }
    }
}
