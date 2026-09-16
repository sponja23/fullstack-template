import { bigint, boolean, index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const apikey = pgTable(
    "apikey",
    {
        id: text("id").primaryKey(),
        configId: text("config_id").notNull(),
        name: text("name"),
        start: text("start"),
        prefix: text("prefix"),
        key: text("key").notNull(),
        referenceId: text("reference_id").notNull(),
        refillInterval: bigint("refill_interval", { mode: "number" }),
        refillAmount: integer("refill_amount"),
        lastRefillAt: timestamp("last_refill_at"),
        enabled: boolean("enabled").default(true).notNull(),
        rateLimitEnabled: boolean("rate_limit_enabled").notNull(),
        rateLimitTimeWindow: bigint("rate_limit_time_window", { mode: "number" }),
        rateLimitMax: integer("rate_limit_max"),
        requestCount: integer("request_count").default(0).notNull(),
        remaining: integer("remaining"),
        lastRequest: timestamp("last_request"),
        expiresAt: timestamp("expires_at"),
        createdAt: timestamp("created_at").notNull(),
        updatedAt: timestamp("updated_at").notNull(),
        metadata: text("metadata"),
        permissions: text("permissions"),
    },
    (table) => [
        index("apikey_key_idx").on(table.key),
        index("apikey_referenceId_idx").on(table.referenceId),
    ],
);

export type ApiKeyRow = typeof apikey.$inferSelect;
