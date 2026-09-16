import { logger } from "@repo/logger";
import { asc, eq } from "drizzle-orm";
import { jsonAgg } from "../../db/json-agg.ts";
import { DatabaseRepository } from "../../db/repository.ts";
import { member, organization, user } from "../../db/schema/index.ts";

export interface DirectoryMember {
    id: string;
    userId: string;
    name: string;
    email: string;
    image: string | null;
    role: string;
}

export interface DirectoryOrganization {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    createdAt: Date;
    members: DirectoryMember[];
}

/** Read-only organization and member directory for superadmins. */
export class OrganizationDirectoryRepository extends DatabaseRepository {
    private readonly logger = logger.child({ name: "OrganizationDirectoryRepository" });

    listOrganizationsWithMembers(): Promise<DirectoryOrganization[]> {
        this.logger.debug("listOrganizationsWithMembers");
        return this.database
            .select({
                id: organization.id,
                name: organization.name,
                slug: organization.slug,
                logo: organization.logo,
                createdAt: organization.createdAt,
                members: jsonAgg(
                    {
                        id: member.id,
                        userId: member.userId,
                        name: user.name,
                        email: user.email,
                        image: user.image,
                        role: member.role,
                    },
                    asc(member.createdAt),
                ),
            })
            .from(organization)
            .leftJoin(member, eq(member.organizationId, organization.id))
            .leftJoin(user, eq(user.id, member.userId))
            .groupBy(organization.id)
            .orderBy(asc(organization.createdAt));
    }
}
