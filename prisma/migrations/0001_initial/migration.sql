CREATE SCHEMA IF NOT EXISTS "public";

CREATE TYPE "UserRole" AS ENUM ('STAFF', 'FINANCE', 'DIRECTOR', 'DEAN', 'VICE_RECTOR', 'RECTOR', 'ADMIN');
CREATE TYPE "RequestStatus" AS ENUM ('DRAFT', 'PENDING_FINANCE', 'PENDING_DIRECTOR', 'PENDING_DEAN', 'PENDING_VICE_RECTOR', 'PENDING_RECTOR', 'FULLY_APPROVED', 'RETURNED', 'CANCELLED');
CREATE TYPE "DisbursementStatus" AS ENUM ('DRAFT', 'PENDING_FINANCE', 'APPROVED', 'RETURNED', 'CANCELLED');

CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'STAFF',
    "departmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExpenseRequest" (
    "id" TEXT NOT NULL,
    "requestNo" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "projectType" TEXT NOT NULL,
    "organizerDepartment" TEXT NOT NULL,
    "contactPhone" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "venueType" TEXT NOT NULL,
    "participants" INTEGER NOT NULL,
    "attendanceFeeMode" TEXT NOT NULL,
    "inPlan" BOOLEAN,
    "isContinuing" BOOLEAN,
    "strategicIssue" TEXT,
    "rationale" TEXT,
    "objectives" TEXT,
    "targetGroup" TEXT,
    "expectedOutcome" TEXT,
    "successIndicator" TEXT,
    "grandTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "status" "RequestStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdById" TEXT NOT NULL,
    "departmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ExpenseRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExpenseItem" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "quantity" DECIMAL(12,2) NOT NULL,
    "unit" TEXT NOT NULL,
    "unitPrice" DECIMAL(14,2) NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "isV119" BOOLEAN NOT NULL DEFAULT false,
    "isContracted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ExpenseItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TrainingSession" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "hours" DECIMAL(5,2) NOT NULL,
    "groupCount" INTEGER,
    "totalAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TrainingSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Speaker" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "speakerType" TEXT NOT NULL,
    "isSpecial" BOOLEAN NOT NULL DEFAULT false,
    "hourlyRate" DECIMAL(14,2) NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Speaker_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ApprovalEvent" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "fromStatus" "RequestStatus",
    "toStatus" "RequestStatus",
    "reason" TEXT,
    "requestIdRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApprovalEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RateCatalog" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "fiscalYear" INTEGER NOT NULL,
    "maxRate" DECIMAL(14,2) NOT NULL,
    "unit" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RateCatalog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Disbursement" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "note" TEXT,
    "status" "DisbursementStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Disbursement_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Department_code_key" ON "Department"("code");
CREATE UNIQUE INDEX "User_externalId_key" ON "User"("externalId");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "User_departmentId_idx" ON "User"("departmentId");
CREATE UNIQUE INDEX "ExpenseRequest_requestNo_key" ON "ExpenseRequest"("requestNo");
CREATE INDEX "ExpenseRequest_createdById_status_idx" ON "ExpenseRequest"("createdById", "status");
CREATE INDEX "ExpenseRequest_status_updatedAt_idx" ON "ExpenseRequest"("status", "updatedAt");
CREATE INDEX "ExpenseRequest_organizerDepartment_idx" ON "ExpenseRequest"("organizerDepartment");
CREATE INDEX "ExpenseItem_requestId_idx" ON "ExpenseItem"("requestId");
CREATE INDEX "TrainingSession_requestId_idx" ON "TrainingSession"("requestId");
CREATE INDEX "Speaker_sessionId_idx" ON "Speaker"("sessionId");
CREATE INDEX "Attachment_requestId_idx" ON "Attachment"("requestId");
CREATE INDEX "ApprovalEvent_requestId_createdAt_idx" ON "ApprovalEvent"("requestId", "createdAt");
CREATE INDEX "ApprovalEvent_actorId_createdAt_idx" ON "ApprovalEvent"("actorId", "createdAt");
CREATE INDEX "RateCatalog_isActive_fiscalYear_idx" ON "RateCatalog"("isActive", "fiscalYear");
CREATE UNIQUE INDEX "RateCatalog_code_fiscalYear_key" ON "RateCatalog"("code", "fiscalYear");
CREATE UNIQUE INDEX "Disbursement_number_key" ON "Disbursement"("number");
CREATE INDEX "Disbursement_status_updatedAt_idx" ON "Disbursement"("status", "updatedAt");
CREATE UNIQUE INDEX "Disbursement_requestId_key" ON "Disbursement"("requestId");

ALTER TABLE "User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ExpenseRequest" ADD CONSTRAINT "ExpenseRequest_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ExpenseRequest" ADD CONSTRAINT "ExpenseRequest_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ExpenseItem" ADD CONSTRAINT "ExpenseItem_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ExpenseRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TrainingSession" ADD CONSTRAINT "TrainingSession_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ExpenseRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Speaker" ADD CONSTRAINT "Speaker_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TrainingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ExpenseRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApprovalEvent" ADD CONSTRAINT "ApprovalEvent_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ExpenseRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApprovalEvent" ADD CONSTRAINT "ApprovalEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Disbursement" ADD CONSTRAINT "Disbursement_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ExpenseRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Disbursement" ADD CONSTRAINT "Disbursement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
