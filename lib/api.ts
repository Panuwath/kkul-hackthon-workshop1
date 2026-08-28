import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "STALE_STATE"
  | "RATE_EXCEEDED"
  | "UPLOAD_INVALID"
  | "DATABASE_NOT_CONFIGURED"
  | "DATABASE_UNAVAILABLE"
  | "AUTH_NOT_CONFIGURED"
  | "INTERNAL_ERROR";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function jsonData<T>(data: T, requestId: string, status = 200): NextResponse {
  return NextResponse.json({ data, meta: { requestId } }, { status, headers: { "x-request-id": requestId } });
}

export function jsonError(error: unknown, requestId: string): NextResponse {
  const normalized = normalizeError(error);
  if (normalized.status >= 500) {
    console.error(JSON.stringify({ requestId, code: normalized.code, message: normalized.message }));
  }

  return NextResponse.json(
    {
      error: {
        code: normalized.code,
        message: normalized.message,
        ...(normalized.details === undefined ? {} : { details: normalized.details }),
      },
      meta: { requestId },
    },
    { status: normalized.status, headers: { "x-request-id": requestId } },
  );
}

function normalizeError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (error instanceof ZodError) {
    return new ApiError(422, "VALIDATION_ERROR", "Request validation failed", error.flatten());
  }

  return new ApiError(500, "INTERNAL_ERROR", "An unexpected error occurred");
}

export function requestIdFrom(request: Request): string {
  const requested = request.headers.get("x-request-id")?.trim();
  return requested && requested.length <= 100 ? requested : crypto.randomUUID();
}

export async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new ApiError(400, "VALIDATION_ERROR", "Request body must be valid JSON");
  }
}

export function parsePositiveInt(value: string | null, fallback: number, max: number): number {
  if (value === null || value === "") return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new ApiError(422, "VALIDATION_ERROR", "Pagination values must be positive integers");
  }
  return Math.min(parsed, max);
}
