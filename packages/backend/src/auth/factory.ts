import { apiKey } from "@better-auth/api-key";
import { logger } from "@repo/logger";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, organization } from "better-auth/plugins";
import * as apiKeySchema from "../db/schema/api-key.schema.ts";
import * as authSchema from "../db/schema/auth.schema.ts";
import * as orgSchema from "../db/schema/organizations.schema.ts";
import type { Database } from "../db/factory.ts";
import type { EmailSender } from "../email/email-sender.ts";
import { roles } from "./access.ts";
import { revokeMemberSessions } from "./session-revocation.ts";
import { SUPERADMIN_ROLE } from "./superadmin.ts";

const authLogger = logger.child({ name: "auth" });

export interface AuthConfig {
    db: Database;
    secret: string;
    webUrl: string;
    allowedHosts: string[];
    emailSender: EmailSender;
    cookieDomain?: string;
}

/** Constructs the better-auth instance mounted by the API at `/auth/*`. */
export function buildAuth(config: AuthConfig) {
    return betterAuth({
        secret: config.secret,
        baseURL: { allowedHosts: config.allowedHosts, fallback: config.webUrl },
        basePath: "/auth",
        trustedOrigins: [config.webUrl],
        ...(config.cookieDomain
            ? {
                  advanced: {
                      crossSubDomainCookies: { enabled: true, domain: config.cookieDomain },
                      defaultCookieAttributes: { secure: true, sameSite: "lax" as const },
                      trustedProxyHeaders: true,
                  },
              }
            : {}),
        database: drizzleAdapter(config.db, {
            provider: "pg",
            schema: {
                user: authSchema.user,
                session: authSchema.session,
                account: authSchema.account,
                verification: authSchema.verification,
                organization: orgSchema.organization,
                member: orgSchema.member,
                invitation: orgSchema.invitation,
                apikey: apiKeySchema.apikey,
            },
        }),
        emailAndPassword: {
            enabled: true,
            sendResetPassword: ({ user, url }) =>
                config.emailSender.send({
                    to: user.email,
                    subject: "Reset your password",
                    text: `Reset your password: ${url}`,
                }),
        },
        databaseHooks: {
            user: {
                create: {
                    before: async (user) => ({ data: { ...user, emailVerified: true } }),
                },
            },
        },
        plugins: [
            organization({
                sendInvitationEmail: ({ id, email, role, organization: invitedOrganization }) =>
                    config.emailSender.send({
                        to: email,
                        subject: `Invitation to ${invitedOrganization.name}`,
                        text: `Invitation ${id} for role ${role}. Accept at ${config.webUrl}/onboarding`,
                    }),
                organizationHooks: {
                    afterRemoveMember: async ({ member, organization: removedFrom }) => {
                        const revokedSessions = await revokeMemberSessions(config.db, {
                            userId: member.userId,
                            organizationId: removedFrom.id,
                        });
                        authLogger.info("revoked removed member sessions", {
                            userId: member.userId,
                            organizationId: removedFrom.id,
                            revokedSessions,
                        });
                    },
                },
            }),
            admin({ adminRoles: [SUPERADMIN_ROLE], roles }),
            apiKey({ references: "organization", enableMetadata: true }),
        ],
    });
}

export type Auth = ReturnType<typeof buildAuth>;
export type BetterAuthSession = Auth["$Infer"]["Session"];
