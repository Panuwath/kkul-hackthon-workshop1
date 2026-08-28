export type RequestStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "returned"
  | "rejected"
  | "disbursed";

export type ProjectCategory =
  | "training"
  | "research"
  | "student_activity"
  | "procurement"
  | "service";

export interface ExpenseItem {
  id: string;
  category: "honorarium" | "travel" | "food" | "material" | "venue" | "other";
  description: string;
  unitPrice: number;
  quantity: number;
  unit: string;
  total: number;
  capLimit?: number;
  capWarning?: string;
}

export interface SpeakerItem {
  id: string;
  name: string;
  position: string;
  organization: string;
  type: "internal" | "external";
  topic: string;
  hours: number;
  ratePerHour: number;
  totalHonorarium: number;
}

export interface AttachmentItem {
  id: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  uploadedAt: string;
  category: "tor" | "schedule" | "approval_letter" | "quotation" | "other";
  downloadUrl?: string;
}

export interface ApprovalTimelineItem {
  id: string;
  stepName: string;
  actorName: string;
  actorRole: string;
  status: "completed" | "current" | "pending" | "returned" | "rejected";
  timestamp?: string;
  comment?: string;
}

export interface PemaRequest {
  id: string;
  code: string; // e.g. REQ-2569-0012
  title: string;
  category: ProjectCategory;
  department: string;
  faculty: string;
  requesterName: string;
  requesterRole: string;
  requesterEmail: string;
  requesterPhone: string;
  createdAt: string;
  updatedAt: string;
  status: RequestStatus;
  version?: number;
  
  // Dates & Venue
  startDate: string;
  endDate: string;
  location: string;
  targetAudienceCount: number;
  
  // Details
  objectives: string[];
  rationale: string;
  expectedOutcomes: string[];
  
  // Strategy Alignment
  strategicPlan: string;
  kpiAlignment: string;
  sustainableGoal?: string;

  // Expenses & Speakers
  expenses: ExpenseItem[];
  speakers: SpeakerItem[];
  attachments: AttachmentItem[];
  
  // Calculated Totals
  totalBudget: number;
  
  // Workflow
  timeline: ApprovalTimelineItem[];
  returnReason?: string;
  allowedActions: ("submit" | "approve" | "return" | "reject" | "cancel" | "edit" | "disburse")[];
}

export interface DisbursementItem {
  id: string;
  expenseItemId: string;
  category: string;
  description: string;
  budgetAllocated: number;
  actualAmount: number;
  invoiceNo: string;
  receiptDate: string;
  vendorName: string;
}

export interface DisbursementRecord {
  id: string;
  disbursementCode: string; // e.g. DISB-2569-0045
  requestId: string;
  requestCode: string;
  projectTitle: string;
  department: string;
  requesterName: string;
  status: "draft" | "under_review" | "paid" | "rejected";
  totalApprovedBudget: number;
  totalActualAmount: number;
  remainingBalance: number;
  payeeName: string;
  bankAccount: string;
  items: DisbursementItem[];
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  note?: string;
}

export interface DashboardMetrics {
  totalRequests: number;
  pendingApprovalCount: number;
  approvedCount: number;
  returnedCount: number;
  totalBudgetRequested: number;
  totalBudgetApproved: number;
  actionRequiredItems: PemaRequest[];
}
