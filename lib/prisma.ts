import { PrismaClient } from "@prisma/client";
import { config } from "@/lib/env";
import { ApiError } from "@/lib/api";

const globalForPrisma = globalThis as unknown as { pemaPrisma?: PrismaClient };

export function getPrisma(): PrismaClient {
  if (!config.databaseUrl) {
    throw new ApiError(503, "DATABASE_NOT_CONFIGURED", "Database configuration is missing");
  }

  if (!globalForPrisma.pemaPrisma) {
    globalForPrisma.pemaPrisma = new PrismaClient({ datasourceUrl: config.databaseUrl });
  }

  return globalForPrisma.pemaPrisma;
}
