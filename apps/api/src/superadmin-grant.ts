import { buildDb, grantSuperadmin } from "@repo/backend";
import { logger } from "@repo/logger";
import { env } from "./env.ts";

const email = process.argv[2];
if (!email) {
    logger.error("usage: pnpm --filter @repo/api superadmin:grant <email>");
    process.exit(1);
}

const { db, pool } = buildDb({ connectionString: env.DATABASE_URL });
try {
    const granted = await grantSuperadmin(db, email);
    logger.info("granted superadmin", { userId: granted.id, email: granted.email });
} finally {
    await pool.end();
}
