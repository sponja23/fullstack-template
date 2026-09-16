import { relations, sql } from "drizzle-orm";
import { check, date, index, integer, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import type { ConstraintName } from "../constraint-names.ts";
import { member, organization } from "./organizations.schema.ts";

export const currencies = ["USD", "EUR"] as const;
export type Currency = (typeof currencies)[number];
export const clientStatuses = ["active", "archived"] as const;
export type ClientStatus = (typeof clientStatuses)[number];
export const projectStatuses = ["active", "archived"] as const;
export type ProjectStatus = (typeof projectStatuses)[number];

export const clientNameUnique = "client_organization_name_unique" satisfies ConstraintName;
export const projectSlugUnique = "project_organization_slug_unique" satisfies ConstraintName;
export const projectRateNonnegative = "project_rate_minor_nonnegative" satisfies ConstraintName;
export const timeEntryMinutesPositive = "time_entry_minutes_positive" satisfies ConstraintName;

export const client = pgTable(
    "client",
    {
        id: text("id").primaryKey(),
        organizationId: text("organization_id")
            .notNull()
            .references(() => organization.id, { onDelete: "cascade" }),
        name: text("name").notNull(),
        billingEmail: text("billing_email").notNull(),
        currency: text("currency", { enum: currencies }).notNull(),
        status: text("status", { enum: clientStatuses }).default("active").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => [
        unique(clientNameUnique).on(table.organizationId, table.name),
        index("client_organization_idx").on(table.organizationId),
    ],
);

export const project = pgTable(
    "project",
    {
        id: text("id").primaryKey(),
        organizationId: text("organization_id")
            .notNull()
            .references(() => organization.id, { onDelete: "cascade" }),
        clientId: text("client_id")
            .notNull()
            .references(() => client.id, { onDelete: "cascade" }),
        name: text("name").notNull(),
        slug: text("slug").notNull(),
        rateMinor: integer("rate_minor").notNull(),
        status: text("status", { enum: projectStatuses }).default("active").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => [
        unique(projectSlugUnique).on(table.organizationId, table.slug),
        check(projectRateNonnegative, sql`${table.rateMinor} >= 0`),
        index("project_organization_idx").on(table.organizationId),
        index("project_client_idx").on(table.clientId),
    ],
);

export const timeEntry = pgTable(
    "time_entry",
    {
        id: text("id").primaryKey(),
        organizationId: text("organization_id")
            .notNull()
            .references(() => organization.id, { onDelete: "cascade" }),
        projectId: text("project_id")
            .notNull()
            .references(() => project.id, { onDelete: "cascade" }),
        authorId: text("author_id")
            .notNull()
            .references(() => member.id, { onDelete: "restrict" }),
        date: date("date", { mode: "string" }).notNull(),
        minutes: integer("minutes").notNull(),
        note: text("note").notNull(),
        // The invoice slice adds the foreign key when it introduces line_item.
        lineItemId: text("line_item_id"),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => [
        check(timeEntryMinutesPositive, sql`${table.minutes} > 0`),
        index("time_entry_organization_idx").on(table.organizationId),
        index("time_entry_project_idx").on(table.projectId),
        index("time_entry_author_date_idx").on(table.authorId, table.date),
    ],
);

export const clientRelations = relations(client, ({ one, many }) => ({
    organization: one(organization, {
        fields: [client.organizationId],
        references: [organization.id],
    }),
    projects: many(project),
}));

export const projectRelations = relations(project, ({ one, many }) => ({
    organization: one(organization, {
        fields: [project.organizationId],
        references: [organization.id],
    }),
    client: one(client, { fields: [project.clientId], references: [client.id] }),
    timeEntries: many(timeEntry),
}));

export const timeEntryRelations = relations(timeEntry, ({ one }) => ({
    organization: one(organization, {
        fields: [timeEntry.organizationId],
        references: [organization.id],
    }),
    project: one(project, { fields: [timeEntry.projectId], references: [project.id] }),
    author: one(member, { fields: [timeEntry.authorId], references: [member.id] }),
}));
