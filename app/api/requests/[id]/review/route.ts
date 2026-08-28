import { reviewRequestSchema } from "@/server/requests/schemas";
import { reviewRequest } from "@/server/requests/service";
import { requireUser } from "@/lib/auth";
import { jsonData, jsonError, readJson, requestIdFrom } from "@/lib/api";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const requestId = requestIdFrom(request);
  try {
    const user = await requireUser(request);
    const { id } = await context.params;
    const input = reviewRequestSchema.parse(await readJson<unknown>(request));
    return jsonData(await reviewRequest(id, user, input), requestId);
  } catch (error) {
    return jsonError(error, requestId);
  }
}
