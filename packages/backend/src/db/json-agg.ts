import { DrizzleError, type InferColumnsDataTypes, type SQL, sql } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";

/** Aggregates a joined one-to-many side into a deterministically ordered JSON array. */
export function jsonAgg<T extends Record<string, PgColumn>>(columns: T, orderBy?: SQL | PgColumn) {
    const entries = Object.entries(columns);
    if (entries.length === 0) throw new DrizzleError({ message: "jsonAgg requires columns" });

    const dateColumns = new Map<string, PgColumn>();
    const objectArgs = sql.join(
        entries.flatMap(([key, column]) => {
            const isDate = column.dataType === "date";
            if (isDate) dateColumns.set(key, column);
            return [sql`${key}::text`, isDate ? sql`${column}::text` : sql`${column}`];
        }),
        sql`, `,
    );
    const required = entries.map(([, column]) => column).filter((column) => column.notNull);
    const filter =
        required.length > 0
            ? sql` filter (where ${sql.join(
                  required.map((column) => sql`${column} is not null`),
                  sql` and `,
              )})`
            : sql``;
    const order = orderBy ? sql` order by ${orderBy}` : sql``;
    const aggregated = sql<
        InferColumnsDataTypes<T>[]
    >`coalesce(json_agg(json_build_object(${objectArgs})${order})${filter}, '[]'::json)`;

    if (dateColumns.size === 0) return aggregated;
    return aggregated.mapWith((rows: Record<string, unknown>[]): InferColumnsDataTypes<T>[] => {
        for (const row of rows) {
            for (const [key, column] of dateColumns) {
                const value = row[key];
                if (typeof value === "string") row[key] = column.mapFromDriverValue(value);
            }
        }
        return rows as InferColumnsDataTypes<T>[];
    });
}
