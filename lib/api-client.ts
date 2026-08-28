export type ApiListResult<T> = {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
};

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

type ApiEnvelope<T> = {
  data: T;
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/pema/api";

function apiUrl(path: string): string {
  return `${apiBaseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

function requestHeaders(): HeadersInit {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (process.env.NODE_ENV !== "production" && (process.env.NEXT_PUBLIC_AUTH_MODE || "dev") === "dev") {
    headers["x-user-id"] = process.env.NEXT_PUBLIC_AUTH_USER_ID || "demo-staff";
    headers["x-user-name"] = process.env.NEXT_PUBLIC_AUTH_USER_NAME || "ผู้ใช้งานระบบ";
    headers["x-user-role"] = process.env.NEXT_PUBLIC_AUTH_ROLE || "STAFF";
  }
  return headers;
}

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(apiUrl(path), {
    ...init,
    cache: "no-store",
    headers: {
      ...requestHeaders(),
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });

  const body = (await response.json().catch(() => ({}))) as ApiEnvelope<T> & {
    error?: { code?: string; message?: string; details?: unknown };
  };
  if (!response.ok) {
    throw new ApiClientError(
      body.error?.message || "ไม่สามารถเชื่อมต่อ API ได้",
      response.status,
      body.error?.code,
      body.error?.details,
    );
  }
  return body.data;
}

export const pemaApi = {
  listRequests(searchParams = ""): Promise<ApiListResult<BackendRequestListItem>> {
    return apiFetch<ApiListResult<BackendRequestListItem>>(`requests${searchParams ? `?${searchParams}` : ""}`);
  },
  getRequest(id: string): Promise<BackendRequest> {
    return apiFetch<BackendRequest>(`requests/${encodeURIComponent(id)}`);
  },
  createRequest(input: BackendRequestInput): Promise<BackendRequest> {
    return apiFetch<BackendRequest>("requests", { method: "POST", body: JSON.stringify(input) });
  },
  updateRequest(id: string, input: BackendRequestPatch): Promise<BackendRequest> {
    return apiFetch<BackendRequest>(`requests/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },
  submitRequest(id: string): Promise<BackendRequest> {
    return apiFetch<BackendRequest>(`requests/${encodeURIComponent(id)}/submit`, { method: "POST" });
  },
  reviewRequest(id: string, input: { version: number; decision: "approve" | "return"; reason?: string }): Promise<BackendRequest> {
    return apiFetch<BackendRequest>(`requests/${encodeURIComponent(id)}/review`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  createDisbursement(id: string, input: { version: number; amount: number; note?: string }): Promise<BackendDisbursement> {
    return apiFetch<BackendDisbursement>(`requests/${encodeURIComponent(id)}/disbursements`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};

export type BackendRequestListItem = {
  id: string;
  requestNo: string;
  projectName: string;
  projectType: string;
  organizerDepartment: string;
  contactPhone?: string | null;
  startDate?: string;
  endDate?: string;
  location?: string;
  venueType?: string;
  participants?: number;
  grandTotal: string;
  status: string;
  version: number;
  createdBy: { id: string; name: string; email: string | null; role: string };
  createdAt: string;
  updatedAt: string;
};

export type BackendRequestInput = {
  projectName: string;
  projectType: string;
  organizerDepartment: string;
  contactPhone?: string;
  startDate: string;
  endDate: string;
  location: string;
  venueType: string;
  participants: number;
  attendanceFeeMode: string;
  inPlan?: boolean;
  isContinuing?: boolean;
  strategicIssue?: string;
  rationale?: string;
  objectives?: string;
  targetGroup?: string;
  expectedOutcome?: string;
  successIndicator?: string;
  items: Array<{
    category: string;
    description?: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    isV119?: boolean;
    isContracted?: boolean;
  }>;
};

export type BackendRequestPatch = Partial<Omit<BackendRequestInput, "items">> & {
  version: number;
  items?: BackendRequestInput["items"];
};

export type BackendRequest = BackendRequestListItem & {
  strategicIssue?: string | null;
  rationale?: string | null;
  objectives?: string | null;
  targetGroup?: string | null;
  expectedOutcome?: string | null;
  successIndicator?: string | null;
  attendanceFeeMode: string;
  inPlan?: boolean | null;
  isContinuing?: boolean | null;
  items: Array<{
    id: string;
    category: string;
    description?: string | null;
    quantity: string;
    unit: string;
    unitPrice: string;
    amount: string;
    isV119: boolean;
    isContracted: boolean;
  }>;
  sessions: Array<{
    id: string;
    topic: string;
    type: string;
    hours: string;
    speakers: Array<{
      id: string;
      name: string;
      speakerType: string;
      hourlyRate: string;
      amount: string;
    }>;
  }>;
  attachments: Array<{
    id: string;
    label: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    createdAt: string;
  }>;
  approvalEvents: Array<{
    id: string;
    action: string;
    fromStatus?: string | null;
    toStatus?: string | null;
    reason?: string | null;
    createdAt: string;
    actor: { id: string; name: string; role: string };
  }>;
  disbursements: BackendDisbursement[];
};

export type BackendDisbursement = {
  id: string;
  requestId: string;
  number: string;
  amount: string;
  note?: string | null;
  status: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
};
