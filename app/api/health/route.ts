import { ApiError, jsonData, jsonError, requestIdFrom } from "@/lib/api";
import { config } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const requestId = requestIdFrom(request);
  const checkedAt = new Date().toISOString();

  if (!config.databaseUrl) {
    return jsonData({ status: "degraded", database: "not_configured", checkedAt }, requestId, 503);
  }

  try {
    await getPrisma().$queryRaw`SELECT 1`;
    return jsonData({ status: "ok", database: "ok", checkedAt }, requestId);
  } catch {
    return jsonError(new ApiError(503, "DATABASE_UNAVAILABLE", "Database health check failed"), requestId);
  }
}
