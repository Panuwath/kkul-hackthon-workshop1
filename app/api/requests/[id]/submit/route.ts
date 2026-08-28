import { submitRequest } from "@/server/requests/service";
import { requireUser } from "@/lib/auth";
import { jsonData, jsonError, requestIdFrom } from "@/lib/api";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const requestId = requestIdFrom(request);
  try {
    const user = await requireUser(request);
    const { id } = await context.params;
    return jsonData(await submitRequest(id, user), requestId);
  } catch (error) {
    return jsonError(error, requestId);
  }
}
