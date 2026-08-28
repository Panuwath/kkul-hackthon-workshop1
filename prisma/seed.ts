import {
  DisbursementStatus,
  Prisma,
  PrismaClient,
  RequestStatus,
  UserRole,
} from "@prisma/client";
import { initialDisbursements } from "../lib/mock-data/disbursements";
import { initialRequests } from "../lib/mock-data/requests";

const prisma = new PrismaClient();

const departmentCodes = new Map(
  [...new Set(initialRequests.map((request) => request.department))].map((name, index) => [
    name,
    `SEED-${String(index + 1).padStart(3, "0")}`,
  ]),
);

function money(value: number): Prisma.Decimal {
  return new Prisma.Decimal(value.toFixed(2));
}

function dateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function mockDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  if (value.length === 10) return dateOnly(value);
  const normalized = value.includes(" ") ? value.replace(" ", "T") : value;
  const withTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/.test(normalized)
    ? normalized
    : `${normalized}+07:00`;
  const result = new Date(withTimezone);
  if (Number.isNaN(result.getTime())) throw new Error(`Invalid seed date: ${value}`);
  return result;
}

function parseFileSize(value: string): number {
  const match = value.trim().match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB)$/i);
  if (!match) return 0;
  const units: Record<string, number> = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3 };
  return Math.round(Number(match[1]) * units[match[2].toUpperCase()]);
}

function requestStatus(status: string): RequestStatus {
  switch (status) {
    case "pending_approval":
      return RequestStatus.PENDING_FINANCE;
    case "approved":
    case "disbursed":
      return RequestStatus.FULLY_APPROVED;
    case "returned":
      return RequestStatus.RETURNED;
    case "rejected":
      return RequestStatus.CANCELLED;
    case "draft":
    default:
      return RequestStatus.DRAFT;
  }
}

function actorRole(role: string): UserRole {
  if (role.includes("อธิการบดี") && !role.includes("รอง")) return UserRole.RECTOR;
  if (role.includes("รองอธิการบดี")) return UserRole.VICE_RECTOR;
  if (role.includes("คณบดี")) return UserRole.DEAN;
  if (role.includes("งบประมาณ") || role.includes("การเงิน")) return UserRole.FINANCE;
  if (role.includes("หัวหน้า") || role.includes("ผู้อำนวยการ")) return UserRole.DIRECTOR;
  return UserRole.STAFF;
}

function timelineAction(stepName: string, status: string, comment?: string): string {
  const text = `${stepName} ${comment ?? ""}`;
  if (text.includes("เบิกจ่าย")) return "disbursement_completed";
  if (status === "returned" || text.includes("ส่งกลับ")) return "returned";
  if (status === "rejected" || text.includes("ไม่อนุมัติ")) return "rejected";
  if (text.includes("อนุมัติ") || text.includes("เห็นชอบ")) return "approved";
  if (text.includes("ยื่น") || text.includes("บันทึก")) return "submitted";
  return "reviewed";
}

function timelineStatus(stepName: string, status: string, request: RequestStatus): RequestStatus {
  if (status === "returned") return RequestStatus.RETURNED;
  if (status === "rejected") return RequestStatus.CANCELLED;
  if (stepName.includes("งบประมาณ") || stepName.includes("การเงิน")) {
    return request === RequestStatus.RETURNED ? RequestStatus.RETURNED : RequestStatus.PENDING_FINANCE;
  }
  if (stepName.includes("หัวหน้า")) return RequestStatus.PENDING_DIRECTOR;
  if (stepName.includes("คณบดี")) return RequestStatus.PENDING_DEAN;
  if (stepName.includes("รองอธิการบดี")) return RequestStatus.PENDING_VICE_RECTOR;
  if (stepName.includes("อธิการบดี") || stepName.includes("อนุมัติขั้นสุดท้าย")) {
    return status === "completed" && request === RequestStatus.FULLY_APPROVED
      ? RequestStatus.FULLY_APPROVED
      : RequestStatus.PENDING_RECTOR;
  }
  if (stepName.includes("เบิกจ่าย")) return RequestStatus.FULLY_APPROVED;
  return request === RequestStatus.DRAFT ? RequestStatus.DRAFT : RequestStatus.PENDING_FINANCE;
}

function userExternalId(requestId: string): string {
  return `seed-requester-${requestId}`;
}

function timelineExternalId(requestId: string, timelineId: string): string {
  return `seed-actor-${requestId}-${timelineId}`;
}

async function seedUsersAndDepartments() {
  const departments = new Map<string, { id: string }>();

  for (const [name, code] of departmentCodes) {
    const department = await prisma.department.upsert({
      where: { code },
      update: { name },
      create: { code, name },
      select: { id: true },
    });
    departments.set(name, department);
  }

  const users = new Map<string, { id: string }>();
  for (const request of initialRequests) {
    const department = departments.get(request.department);
    if (!department) throw new Error(`Missing department for request ${request.id}`);

    const user = await prisma.user.upsert({
      where: { externalId: userExternalId(request.id) },
      update: {
        email: request.requesterEmail,
        name: request.requesterName,
        role: UserRole.STAFF,
        departmentId: department.id,
      },
      create: {
        externalId: userExternalId(request.id),
        email: request.requesterEmail,
        name: request.requesterName,
        role: UserRole.STAFF,
        departmentId: department.id,
      },
      select: { id: true },
    });
    users.set(request.id, user);

    for (const timeline of request.timeline) {
      const timelineUser = await prisma.user.upsert({
        where: { externalId: timelineExternalId(request.id, timeline.id) },
        update: { name: timeline.actorName, role: actorRole(timeline.actorRole), departmentId: department.id },
        create: {
          externalId: timelineExternalId(request.id, timeline.id),
          name: timeline.actorName,
          role: actorRole(timeline.actorRole),
          departmentId: department.id,
        },
        select: { id: true },
      });
      users.set(`${request.id}:${timeline.id}`, timelineUser);
    }
  }

  return { departments, users };
}

async function seedRequests(
  departments: Map<string, { id: string }>,
  users: Map<string, { id: string }>,
): Promise<Map<string, string>> {
  const requestIds = new Map<string, string>();

  for (const request of initialRequests) {
    const department = departments.get(request.department);
    const createdBy = users.get(request.id);
    if (!department || !createdBy) throw new Error(`Missing seed relation for request ${request.id}`);

    const status = requestStatus(request.status);
    const total = request.expenses.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    if (Math.abs(total - request.totalBudget) > 0.01) {
      console.warn(`Seed total mismatch for ${request.code}: mock=${request.totalBudget} calculated=${total}`);
    }

    const persisted = await prisma.expenseRequest.upsert({
      where: { requestNo: request.code },
      update: {
        projectName: request.title,
        projectType: request.category,
        organizerDepartment: request.department,
        contactPhone: request.requesterPhone,
        startDate: dateOnly(request.startDate),
        endDate: dateOnly(request.endDate),
        location: request.location,
        venueType: request.faculty,
        participants: request.targetAudienceCount,
        attendanceFeeMode: "none",
        inPlan: true,
        isContinuing: false,
        strategicIssue: request.strategicPlan,
        rationale: request.rationale,
        objectives: request.objectives.join("\n"),
        targetGroup: `ผู้เข้าร่วมโครงการ ${request.targetAudienceCount} คน`,
        expectedOutcome: request.expectedOutcomes.join("\n"),
        successIndicator: [request.kpiAlignment, request.sustainableGoal].filter(Boolean).join(" | "),
        grandTotal: money(total),
        status,
        version: request.version ?? Math.max(1, request.timeline.length),
        createdById: createdBy.id,
        departmentId: department.id,
      },
      create: {
        id: request.id,
        requestNo: request.code,
        projectName: request.title,
        projectType: request.category,
        organizerDepartment: request.department,
        contactPhone: request.requesterPhone,
        startDate: dateOnly(request.startDate),
        endDate: dateOnly(request.endDate),
        location: request.location,
        venueType: request.faculty,
        participants: request.targetAudienceCount,
        attendanceFeeMode: "none",
        inPlan: true,
        isContinuing: false,
        strategicIssue: request.strategicPlan,
        rationale: request.rationale,
        objectives: request.objectives.join("\n"),
        targetGroup: `ผู้เข้าร่วมโครงการ ${request.targetAudienceCount} คน`,
        expectedOutcome: request.expectedOutcomes.join("\n"),
        successIndicator: [request.kpiAlignment, request.sustainableGoal].filter(Boolean).join(" | "),
        grandTotal: money(total),
        status,
        version: request.version ?? Math.max(1, request.timeline.length),
        createdById: createdBy.id,
        departmentId: department.id,
        createdAt: mockDate(request.createdAt),
      },
      select: { id: true },
    });
    requestIds.set(request.id, persisted.id);

    await prisma.$transaction(async (tx) => {
      await tx.expenseItem.deleteMany({ where: { requestId: persisted.id } });
      await tx.trainingSession.deleteMany({ where: { requestId: persisted.id } });
      await tx.attachment.deleteMany({ where: { requestId: persisted.id } });
      await tx.approvalEvent.deleteMany({ where: { requestId: persisted.id } });

      if (request.expenses.length > 0) {
        await tx.expenseItem.createMany({
          data: request.expenses.map((item) => ({
            id: `seed-${request.id}-${item.id}`,
            requestId: persisted.id,
            category: item.category,
            description: item.description,
            quantity: money(item.quantity),
            unit: item.unit,
            unitPrice: money(item.unitPrice),
            amount: money(item.quantity * item.unitPrice),
          })),
        });
      }

      for (const [index, speaker] of request.speakers.entries()) {
        await tx.trainingSession.create({
          data: {
            id: `seed-session-${request.id}-${speaker.id}`,
            requestId: persisted.id,
            topic: speaker.topic,
            type: request.category,
            hours: money(speaker.hours),
            groupCount: request.targetAudienceCount,
            totalAmount: money(speaker.totalHonorarium),
            speakers: {
              create: {
                id: `seed-speaker-${request.id}-${speaker.id}-${index}`,
                name: speaker.name,
                speakerType: speaker.type,
                hourlyRate: money(speaker.ratePerHour),
                amount: money(speaker.totalHonorarium),
              },
            },
          },
        });
      }

      if (request.attachments.length > 0) {
        await tx.attachment.createMany({
          data: request.attachments.map((attachment) => ({
            id: `seed-${request.id}-${attachment.id}`,
            requestId: persisted.id,
            label: attachment.category,
            fileName: attachment.fileName,
            storageKey: `seed/${request.id}/${attachment.id}/${attachment.fileName}`,
            mimeType: attachment.fileType,
            sizeBytes: parseFileSize(attachment.fileSize),
            createdAt: mockDate(attachment.uploadedAt),
          })),
        });
      }

      if (request.timeline.length > 0) {
        let previousStatus: RequestStatus | null = null;
        await tx.approvalEvent.createMany({
          data: request.timeline.map((timeline) => {
            const toStatus = timelineStatus(timeline.stepName, timeline.status, status);
            const event = {
              id: `seed-${request.id}-${timeline.id}`,
              requestId: persisted.id,
              actorId: users.get(`${request.id}:${timeline.id}`)?.id ?? createdBy.id,
              action: timelineAction(timeline.stepName, timeline.status, timeline.comment),
              fromStatus: previousStatus,
              toStatus,
              reason: timeline.comment ?? (request.status === "returned" ? request.returnReason : undefined),
              createdAt: mockDate(timeline.timestamp),
            };
            previousStatus = toStatus;
            return event;
          }),
        });
      }
    });
  }

  return requestIds;
}

async function seedDisbursements(requestIds: Map<string, string>, users: Map<string, { id: string }>) {
  const statusMap: Record<string, DisbursementStatus> = {
    draft: DisbursementStatus.DRAFT,
    under_review: DisbursementStatus.PENDING_FINANCE,
    paid: DisbursementStatus.APPROVED,
    rejected: DisbursementStatus.RETURNED,
  };

  for (const disbursement of initialDisbursements) {
    const requestId = requestIds.get(disbursement.requestId);
    const createdBy = users.get(disbursement.requestId);
    if (!requestId || !createdBy) throw new Error(`Missing request for disbursement ${disbursement.disbursementCode}`);

    const data = {
      requestId,
      number: disbursement.disbursementCode,
      amount: money(disbursement.totalActualAmount),
      note: disbursement.note,
      status: statusMap[disbursement.status] ?? DisbursementStatus.DRAFT,
      createdById: createdBy.id,
      createdAt: mockDate(disbursement.createdAt),
    };
    const existing = await prisma.disbursement.findUnique({ where: { requestId } });
    if (existing) {
      await prisma.disbursement.update({ where: { id: existing.id }, data });
    } else {
      await prisma.disbursement.create({ data: { id: disbursement.id, ...data } });
    }
  }
}

async function main() {
  const { departments, users } = await seedUsersAndDepartments();
  const requestIds = await seedRequests(departments, users);
  await seedDisbursements(requestIds, users);

  const [departmentCount, userCount, requestCount, itemCount, sessionCount, attachmentCount, eventCount, disbursementCount] =
    await Promise.all([
      prisma.department.count(),
      prisma.user.count(),
      prisma.expenseRequest.count(),
      prisma.expenseItem.count(),
      prisma.trainingSession.count(),
      prisma.attachment.count(),
      prisma.approvalEvent.count(),
      prisma.disbursement.count(),
    ]);

  console.log(
    `Seed complete: departments=${departmentCount} users=${userCount} requests=${requestCount} items=${itemCount} sessions=${sessionCount} attachments=${attachmentCount} approvalEvents=${eventCount} disbursements=${disbursementCount}`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
