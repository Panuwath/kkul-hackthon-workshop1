import { jwtVerify } from "jose";
import { UserRole } from "@prisma/client";
import { ApiError } from "@/lib/api";
import { config } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";

export type CurrentUser = {
  id: string;
  externalId: string;
  name: string;
  email: string | null;
  role: UserRole;
  departmentId: string | null;
};

type Identity = {
  externalId: string;
  name: string;
  email?: string;
  role: UserRole;
  departmentCode?: string;
};

const roles = new Set(Object.values(UserRole));

function parseRole(value: unknown): UserRole | undefined {
  if (typeof value !== "string") return undefined;
  const role = value.toUpperCase() as UserRole;
  return roles.has(role) ? role : undefined;
}

async function identityFromJwt(request: Request): Promise<Identity> {
  if (!config.authJwtSecret) {
    throw new ApiError(503, "AUTH_NOT_CONFIGURED", "JWT authentication is not configured");
  }

  const header = request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7).trim() : undefined;
  if (!token) throw new ApiError(401, "UNAUTHORIZED", "Authentication is required");

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(config.authJwtSecret), {
      algorithms: ["HS256"],
    });
    const externalId = typeof payload.sub === "string" ? payload.sub : undefined;
    const role = parseRole(payload.role);
    if (!externalId || !role) throw new ApiError(401, "UNAUTHORIZED", "Token claims are incomplete");

    return {
      externalId,
      name: typeof payload.name === "string" ? payload.name : externalId,
      email: typeof payload.email === "string" ? payload.email : undefined,
      role,
      departmentCode: typeof payload.departmentCode === "string" ? payload.departmentCode : undefined,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, "UNAUTHORIZED", "Invalid or expired access token");
  }
}

function identityFromDevHeaders(request: Request): Identity {
  if (config.appEnv === "production") {
    throw new ApiError(503, "AUTH_NOT_CONFIGURED", "Production requires JWT authentication");
  }

  const externalId = request.headers.get("x-user-id")?.trim() || "demo-staff";
  const role = parseRole(request.headers.get("x-user-role") ?? "STAFF") ?? UserRole.STAFF;
  const name = request.headers.get("x-user-name")?.trim() || externalId;
  const email = request.headers.get("x-user-email")?.trim() || undefined;
  const departmentCode = request.headers.get("x-department-code")?.trim() || undefined;
  return { externalId, name, email, role, departmentCode };
}

async function resolveIdentity(request: Request): Promise<Identity> {
  if (config.authMode === "dev") return identityFromDevHeaders(request);
  if (config.authMode === "jwt") return identityFromJwt(request);
  throw new ApiError(503, "AUTH_NOT_CONFIGURED", "Unsupported authentication mode");
}

export async function requireUser(request: Request): Promise<CurrentUser> {
  const identity = await resolveIdentity(request);
  const db = getPrisma();
  const department = identity.departmentCode
    ? await db.department.findUnique({ where: { code: identity.departmentCode }, select: { id: true } })
    : undefined;

  const user = await db.user.upsert({
    where: { externalId: identity.externalId },
    update: {
      name: identity.name,
      role: identity.role,
      ...(identity.email ? { email: identity.email } : {}),
      ...(department ? { departmentId: department.id } : {}),
    },
    create: {
      externalId: identity.externalId,
      name: identity.name,
      email: identity.email,
      role: identity.role,
      departmentId: department?.id,
    },
  });

  return user;
}
