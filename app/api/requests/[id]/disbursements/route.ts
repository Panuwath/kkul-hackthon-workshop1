import { disbursementSchema } from "@/server/requests/schemas";
import { createDisbursement } from "@/server/requests/service";
import { requireUser } from "@/lib/auth";
import { jsonData, jsonError, readJson, requestIdFrom } from "@/lib/api";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const requestId = requestIdFrom(request);
  try {
    const user = await requireUser(request);
    const { id } = await context.params;
    const input = disbursementSchema.parse(await readJson<unknown>(request));
    return jsonData(await createDisbursement(id, user, input), requestId, 201);
  } catch (error) {
    return jsonError(error, requestId);
  }
}
