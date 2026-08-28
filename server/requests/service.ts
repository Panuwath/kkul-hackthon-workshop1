import { Prisma, RequestStatus, UserRole } from "@prisma/client";
import { ApiError } from "@/lib/api";
import { getPrisma } from "@/lib/prisma";
import { CurrentUser } from "@/lib/auth";
import { assertCanReview, assertEditable, canViewAllRequests, nextApprovedStatus } from "@/server/requests/status";
import {
  CreateRequestInput,
  DisbursementInput,
  PatchRequestInput,
  ReviewRequestInput,
} from "@/server/requests/schemas";

const requestInclude = {
  createdBy: { select: { id: true, name: true, email: true, role: true } },
  items: { orderBy: { createdAt: "asc" as const } },
  sessions: { include: { speakers: true }, orderBy: { createdAt: "asc" as const } },
  attachments: { orderBy: { createdAt: "asc" as const } },
  approvalEvents: {
    include: { actor: { select: { id: true, name: true, role: true } } },
    orderBy: { createdAt: "asc" as const },
  },
  disbursements: { orderBy: { createdAt: "asc" as const } },
} satisfies Prisma.ExpenseRequestInclude;

const listInclude = {
  createdBy: { select: { id: true, name: true, email: true, role: true } },
} satisfies Prisma.ExpenseRequestInclude;

type RequestWithRelations = Prisma.ExpenseRequestGetPayload<{ include: typeof requestInclude }>;
type RequestForList = Prisma.ExpenseRequestGetPayload<{ include: typeof listInclude }>;

function money(value: number): Prisma.Decimal {
  return new Prisma.Decimal(value.toFixed(2));
}

function moneyString(value: Prisma.Decimal | null | undefined): string {
  return value?.toFixed(2) ?? "0.00";
}

function itemAmount(quantity: number, unitPrice: number): Prisma.Decimal {
  return money(quantity * unitPrice);
}

function sumItems(items: Array<{ quantity: number; unitPrice: number }>): Prisma.Decimal {
  return items.reduce((total, item) => total.add(itemAmount(item.quantity, item.unitPrice)), new Prisma.Decimal(0));
}

function requestNumber(): string {
  return `PEMA-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`;
}

function assertCanManage(request: { createdById: string }, user: CurrentUser): void {
  if (user.role !== UserRole.ADMIN && request.createdById !== user.id) {
    throw new ApiError(403, "FORBIDDEN", "You do not have access to this request");
  }
}

function assertCanRead(request: { createdById: string }, user: CurrentUser): void {
  if (!canViewAllRequests(user.role)) assertCanManage(request, user);
}

function serializeRequest(request: RequestWithRelations) {
  return {
    id: request.id,
    requestNo: request.requestNo,
    projectName: request.projectName,
    projectType: request.projectType,
    organizerDepartment: request.organizerDepartment,
    contactPhone: request.contactPhone,
    startDate: request.startDate.toISOString(),
    endDate: request.endDate.toISOString(),
    location: request.location,
    venueType: request.venueType,
    participants: request.participants,
    attendanceFeeMode: request.attendanceFeeMode,
    inPlan: request.inPlan,
    isContinuing: request.isContinuing,
    strategicIssue: request.strategicIssue,
    rationale: request.rationale,
    objectives: request.objectives,
    targetGroup: request.targetGroup,
    expectedOutcome: request.expectedOutcome,
    successIndicator: request.successIndicator,
    grandTotal: moneyString(request.grandTotal),
    status: request.status,
    version: request.version,
    createdBy: request.createdBy,
    items: request.items.map((item) => ({
      ...item,
      quantity: moneyString(item.quantity),
      unitPrice: moneyString(item.unitPrice),
      amount: moneyString(item.amount),
    })),
    sessions: request.sessions.map((session) => ({
      ...session,
      hours: moneyString(session.hours),
      totalAmount: moneyString(session.totalAmount),
      speakers: session.speakers.map((speaker) => ({
        ...speaker,
        hourlyRate: moneyString(speaker.hourlyRate),
        amount: moneyString(speaker.amount),
      })),
    })),
    attachments: request.attachments,
    approvalEvents: request.approvalEvents,
    disbursements: request.disbursements.map((disbursement) => ({
      ...disbursement,
      amount: moneyString(disbursement.amount),
    })),
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
  };
}

function serializeListItem(request: RequestForList) {
  return {
    id: request.id,
    requestNo: request.requestNo,
    projectName: request.projectName,
    projectType: request.projectType,
    organizerDepartment: request.organizerDepartment,
    contactPhone: request.contactPhone,
    startDate: request.startDate.toISOString(),
    endDate: request.endDate.toISOString(),
    location: request.location,
    venueType: request.venueType,
    participants: request.participants,
    grandTotal: moneyString(request.grandTotal),
    status: request.status,
    version: request.version,
    createdBy: request.createdBy,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
  };
}

async function findFullRequestOrThrow(db: PrismaClientLike, id: string): Promise<RequestWithRelations> {
  const request = await db.expenseRequest.findUnique({ where: { id }, include: requestInclude });
  if (!request) throw new ApiError(404, "NOT_FOUND", "Expense request was not found");
  return request;
}

type PrismaClientLike = Pick<ReturnType<typeof getPrisma>, "expenseRequest">;

export async function listRequests(
  user: CurrentUser,
  filters: { status?: RequestStatus; search?: string; page: number; pageSize: number },
) {
  const db = getPrisma();
  const where: Prisma.ExpenseRequestWhereInput = {
    ...(canViewAllRequests(user.role) ? {} : { createdById: user.id }),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.search
      ? {
          OR: [
            { requestNo: { contains: filters.search, mode: "insensitive" } },
            { projectName: { contains: filters.search, mode: "insensitive" } },
            { organizerDepartment: { contains: filters.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [totalItems, requests] = await db.$transaction([
    db.expenseRequest.count({ where }),
    db.expenseRequest.findMany({
      where,
      include: listInclude,
      orderBy: { updatedAt: "desc" },
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
  ]);

  return {
    data: requests.map(serializeListItem),
    pagination: {
      page: filters.page,
      pageSize: filters.pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / filters.pageSize),
    },
  };
}

export async function getRequest(id: string, user: CurrentUser) {
  const db = getPrisma();
  const request = await findFullRequestOrThrow(db, id);
  assertCanRead(request, user);
  return serializeRequest(request);
}

export async function createRequest(user: CurrentUser, input: CreateRequestInput) {
  if (user.role !== UserRole.STAFF && user.role !== UserRole.ADMIN) {
    throw new ApiError(403, "FORBIDDEN", "Only staff can create an expense request");
  }

  const db = getPrisma();
  const total = sumItems(input.items);
  const request = await db.expenseRequest.create({
    data: {
      requestNo: requestNumber(),
      projectName: input.projectName,
      projectType: input.projectType,
      organizerDepartment: input.organizerDepartment,
      contactPhone: input.contactPhone,
      startDate: input.startDate,
      endDate: input.endDate,
      location: input.location,
      venueType: input.venueType,
      participants: input.participants,
      attendanceFeeMode: input.attendanceFeeMode,
      inPlan: input.inPlan,
      isContinuing: input.isContinuing,
      strategicIssue: input.strategicIssue,
      rationale: input.rationale,
      objectives: input.objectives,
      targetGroup: input.targetGroup,
      expectedOutcome: input.expectedOutcome,
      successIndicator: input.successIndicator,
      grandTotal: total,
      createdById: user.id,
      departmentId: user.departmentId,
      items: {
        create: input.items.map((item) => ({
          category: item.category,
          description: item.description,
          quantity: money(item.quantity),
          unit: item.unit,
          unitPrice: money(item.unitPrice),
          amount: itemAmount(item.quantity, item.unitPrice),
          isV119: item.isV119,
          isContracted: item.isContracted,
        })),
      },
      approvalEvents: { create: { actorId: user.id, action: "draft_saved" } },
    },
    include: requestInclude,
  });

  return serializeRequest(request);
}

export async function updateRequest(id: string, user: CurrentUser, input: PatchRequestInput) {
  const db = getPrisma();
  const request = await db.$transaction(async (tx) => {
    const current = await tx.expenseRequest.findUnique({ where: { id }, include: { items: true } });
    if (!current) throw new ApiError(404, "NOT_FOUND", "Expense request was not found");
    assertCanManage(current, user);
    assertEditable(current.status);
    if (current.version !== input.version) {
      throw new ApiError(409, "STALE_STATE", "The request changed since it was loaded");
    }

    const updateData: Prisma.ExpenseRequestUpdateInput = { version: { increment: 1 } };
    const fields = [
      "projectName", "projectType", "organizerDepartment", "contactPhone", "startDate", "endDate",
      "location", "venueType", "participants", "attendanceFeeMode", "inPlan", "isContinuing",
      "strategicIssue", "rationale", "objectives", "targetGroup", "expectedOutcome", "successIndicator",
    ] as const;
    for (const field of fields) {
      if (input[field] !== undefined) updateData[field] = input[field] as never;
    }

    if (input.items !== undefined) {
      updateData.grandTotal = sumItems(input.items);
      await tx.expenseItem.deleteMany({ where: { requestId: id } });
      if (input.items.length > 0) {
        await tx.expenseItem.createMany({
          data: input.items.map((item) => ({
            requestId: id,
            category: item.category,
            description: item.description,
            quantity: money(item.quantity),
            unit: item.unit,
            unitPrice: money(item.unitPrice),
            amount: itemAmount(item.quantity, item.unitPrice),
            isV119: item.isV119,
            isContracted: item.isContracted,
          })),
        });
      }
    }

    const result = await tx.expenseRequest.updateMany({
      where: { id, version: input.version, status: current.status },
      data: updateData,
    });
    if (result.count !== 1) throw new ApiError(409, "STALE_STATE", "The request changed since it was loaded");
    await tx.approvalEvent.create({ data: { requestId: id, actorId: user.id, action: "draft_saved" } });
    return findFullRequestOrThrow(tx, id);
  });

  return serializeRequest(request);
}

export async function submitRequest(id: string, user: CurrentUser) {
  const db = getPrisma();
  const request = await db.$transaction(async (tx) => {
    const current = await tx.expenseRequest.findUnique({ where: { id }, include: { items: true, sessions: true } });
    if (!current) throw new ApiError(404, "NOT_FOUND", "Expense request was not found");
    assertCanManage(current, user);
    if (current.status !== RequestStatus.DRAFT && current.status !== RequestStatus.RETURNED) {
      throw new ApiError(409, "CONFLICT", "Only draft or returned requests can be submitted");
    }
    if (current.items.length === 0 && current.sessions.length === 0) {
      throw new ApiError(422, "VALIDATION_ERROR", "At least one expense item is required before submission");
    }

    const result = await tx.expenseRequest.updateMany({
      where: { id, version: current.version, status: current.status },
      data: { status: RequestStatus.PENDING_FINANCE, version: { increment: 1 } },
    });
    if (result.count !== 1) throw new ApiError(409, "STALE_STATE", "The request changed since it was loaded");
    await tx.approvalEvent.create({
      data: {
        requestId: id,
        actorId: user.id,
        action: "submitted",
        fromStatus: current.status,
        toStatus: RequestStatus.PENDING_FINANCE,
      },
    });
    return findFullRequestOrThrow(tx, id);
  });

  return serializeRequest(request);
}

export async function reviewRequest(id: string, user: CurrentUser, input: ReviewRequestInput) {
  const db = getPrisma();
  const request = await db.$transaction(async (tx) => {
    const current = await tx.expenseRequest.findUnique({ where: { id }, include: { items: true, sessions: true } });
    if (!current) throw new ApiError(404, "NOT_FOUND", "Expense request was not found");
    assertCanReview(current.status, user.role);
    if (current.version !== input.version) {
      throw new ApiError(409, "STALE_STATE", "The request changed since it was loaded");
    }

    const nextStatus = input.decision === "return" ? RequestStatus.RETURNED : nextApprovedStatus(current.status);
    const result = await tx.expenseRequest.updateMany({
      where: { id, version: input.version, status: current.status },
      data: { status: nextStatus, version: { increment: 1 } },
    });
    if (result.count !== 1) throw new ApiError(409, "STALE_STATE", "The request changed since it was loaded");
    await tx.approvalEvent.create({
      data: {
        requestId: id,
        actorId: user.id,
        action: input.decision === "return" ? "returned" : "approved",
        fromStatus: current.status,
        toStatus: nextStatus,
        reason: input.reason,
      },
    });
    return findFullRequestOrThrow(tx, id);
  }, { isolationLevel: "Serializable" });

  return serializeRequest(request);
}

export async function createDisbursement(id: string, user: CurrentUser, input: DisbursementInput) {
  const db = getPrisma();
  const disbursement = await db.$transaction(async (tx) => {
    const request = await tx.expenseRequest.findUnique({
      where: { id },
      select: { createdById: true, status: true, grandTotal: true, version: true },
    });
    if (!request) throw new ApiError(404, "NOT_FOUND", "Expense request was not found");
    if (request.status !== RequestStatus.FULLY_APPROVED) {
      throw new ApiError(409, "CONFLICT", "Disbursement can only be created from a fully approved request");
    }
    if (request.version !== input.version) {
      throw new ApiError(409, "STALE_STATE", "The request changed since it was loaded");
    }
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.FINANCE && request.createdById !== user.id) {
      throw new ApiError(403, "FORBIDDEN", "You do not have access to create this disbursement");
    }
    if (new Prisma.Decimal(input.amount).gt(request.grandTotal)) {
      throw new ApiError(422, "VALIDATION_ERROR", "Disbursement amount cannot exceed the approved total");
    }

    const existing = await tx.disbursement.findUnique({ where: { requestId: id } });
    if (existing) throw new ApiError(409, "CONFLICT", "A disbursement already exists for this request");

    const result = await tx.disbursement.create({
      data: {
        requestId: id,
        number: `PEMA-D-${Date.now().toString(36).toUpperCase()}`,
        amount: money(input.amount),
        note: input.note,
        createdById: user.id,
      },
    });
    const requestUpdate = await tx.expenseRequest.updateMany({
      where: { id, version: input.version, status: RequestStatus.FULLY_APPROVED },
      data: { version: { increment: 1 } },
    });
    if (requestUpdate.count !== 1) throw new ApiError(409, "STALE_STATE", "The request changed since it was loaded");
    await tx.approvalEvent.create({ data: { requestId: id, actorId: user.id, action: "disbursement_created" } });
    return result;
  });

  return { ...disbursement, amount: moneyString(disbursement.amount), createdAt: disbursement.createdAt.toISOString(), updatedAt: disbursement.updatedAt.toISOString() };
}
