import { RequestStatus } from "@prisma/client";
import { createRequestSchema } from "@/server/requests/schemas";
import { createRequest, listRequests } from "@/server/requests/service";
import { requireUser } from "@/lib/auth";
import { ApiError, jsonData, jsonError, parsePositiveInt, readJson, requestIdFrom } from "@/lib/api";

export async function GET(request: Request) {
  const requestId = requestIdFrom(request);
  try {
    const user = await requireUser(request);
    const params = new URL(request.url).searchParams;
    const rawStatus = params.get("status")?.toUpperCase();
    const status = rawStatus ? (Object.values(RequestStatus).includes(rawStatus as RequestStatus) ? rawStatus as RequestStatus : undefined) : undefined;
    if (rawStatus && !status) throw new ApiError(422, "VALIDATION_ERROR", "Unknown request status");
    const result = await listRequests(user, {
      status,
      search: params.get("search")?.trim() || undefined,
      page: parsePositiveInt(params.get("page"), 1, 10_000),
      pageSize: parsePositiveInt(params.get("pageSize"), 20, 100),
    });
    return jsonData(result, requestId, 200);
  } catch (error) {
    return jsonError(error, requestId);
  }
}

export async function POST(request: Request) {
  const requestId = requestIdFrom(request);
  try {
    const user = await requireUser(request);
    const input = createRequestSchema.parse(await readJson<unknown>(request));
    const result = await createRequest(user, input);
    return jsonData(result, requestId, 201);
  } catch (error) {
    return jsonError(error, requestId);
  }
}
