import { z } from "zod";

const expenseItemSchema = z.object({
  category: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional(),
  quantity: z.number().finite().positive().max(1_000_000),
  unit: z.string().trim().min(1).max(50),
  unitPrice: z.number().finite().nonnegative().max(1_000_000_000),
  isV119: z.boolean().optional().default(false),
  isContracted: z.boolean().optional().default(false),
}).strict();

const requestFields = {
  projectName: z.string().trim().min(2).max(200),
  projectType: z.string().trim().min(1).max(100),
  organizerDepartment: z.string().trim().min(1).max(200),
  contactPhone: z.string().trim().max(50).optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  location: z.string().trim().min(1).max(250),
  venueType: z.string().trim().min(1).max(100),
  participants: z.number().int().positive().max(1_000_000),
  attendanceFeeMode: z.string().trim().min(1).max(100),
  inPlan: z.boolean().optional(),
  isContinuing: z.boolean().optional(),
  strategicIssue: z.string().trim().max(5_000).optional(),
  rationale: z.string().trim().max(10_000).optional(),
  objectives: z.string().trim().max(10_000).optional(),
  targetGroup: z.string().trim().max(5_000).optional(),
  expectedOutcome: z.string().trim().max(10_000).optional(),
  successIndicator: z.string().trim().max(5_000).optional(),
};

const requestFieldsSchema = z.object(requestFields).strict();

const dateOrder = (value: { startDate: Date; endDate: Date }, context: z.RefinementCtx) => {
  if (value.endDate < value.startDate) {
    context.addIssue({ code: "custom", path: ["endDate"], message: "endDate must be on or after startDate" });
  }
};

export const createRequestSchema = requestFieldsSchema.extend({
  items: z.array(expenseItemSchema).max(100).default([]),
}).superRefine(dateOrder);

export const patchRequestSchema = requestFieldsSchema.partial().extend({
  version: z.number().int().positive(),
  items: z.array(expenseItemSchema).max(100).optional(),
}).superRefine((value, context) => {
  if (value.startDate && value.endDate && value.endDate < value.startDate) {
    context.addIssue({ code: "custom", path: ["endDate"], message: "endDate must be on or after startDate" });
  }
});

export const reviewRequestSchema = z.object({
  version: z.number().int().positive(),
  decision: z.enum(["approve", "return"]),
  reason: z.string().trim().max(2_000).optional(),
}).strict().superRefine((value, context) => {
  if (value.decision === "return" && !value.reason) {
    context.addIssue({ code: "custom", path: ["reason"], message: "reason is required when returning a request" });
  }
});

export const disbursementSchema = z.object({
  version: z.number().int().positive(),
  amount: z.number().finite().positive().max(1_000_000_000),
  note: z.string().trim().max(2_000).optional(),
}).strict();

export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type PatchRequestInput = z.infer<typeof patchRequestSchema>;
export type ReviewRequestInput = z.infer<typeof reviewRequestSchema>;
export type DisbursementInput = z.infer<typeof disbursementSchema>;
