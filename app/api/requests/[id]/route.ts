import { patchRequestSchema } from "@/server/requests/schemas";
import { getRequest, updateRequest } from "@/server/requests/service";
import { requireUser } from "@/lib/auth";
import { jsonData, jsonError, readJson, requestIdFrom } from "@/lib/api";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const requestId = requestIdFrom(request);
  try {
    const user = await requireUser(request);
    const { id } = await context.params;
    return jsonData(await getRequest(id, user), requestId);
  } catch (error) {
    return jsonError(error, requestId);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const requestId = requestIdFrom(request);
  try {
    const user = await requireUser(request);
    const { id } = await context.params;
    const input = patchRequestSchema.parse(await readJson<unknown>(request));
    return jsonData(await updateRequest(id, user, input), requestId);
  } catch (error) {
    return jsonError(error, requestId);
  }
}
