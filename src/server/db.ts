import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
// Triggering reload for new Prisma schema
import { PrismaClient } from "../../prisma/generated/prisma";
import { env } from "~/env";

const createPrismaClient = () => {
  const pool = new Pool({ connectionString: env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
