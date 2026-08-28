"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { ApiClientError, BackendDisbursement, BackendRequest, BackendRequestInput, pemaApi } from "../api-client";
import { DisbursementRecord, ExpenseItem, PemaRequest, RequestStatus, SpeakerItem } from "../types/pema";

interface RequestContextType {
  requests: PemaRequest[];
  disbursements: DisbursementRecord[];
  isLoading: boolean;
  error: string | null;
  getRequestById: (id: string) => PemaRequest | undefined;
  getRequestByIdAsync: (id: string) => Promise<PemaRequest | undefined>;
  getDisbursementById: (id: string) => DisbursementRecord | undefined;
  createRequest: (newReq: Partial<PemaRequest>) => Promise<PemaRequest>;
  updateRequest: (id: string, updated: Partial<PemaRequest>) => Promise<PemaRequest>;
  updateRequestStatus: (id: string, status: PemaRequest["status"], comment?: string) => Promise<PemaRequest>;
  deleteRequest: (id: string) => Promise<void>;
  createDisbursement: (newDisb: Partial<DisbursementRecord>) => Promise<DisbursementRecord>;
}

const RequestContext = createContext<RequestContextType | undefined>(undefined);

const splitLines = (value?: string | null): string[] =>
  value?.split(/\r?\n/).map((line) => line.trim()).filter(Boolean) ?? [];

const toNumber = (value: string | number | null | undefined): number => Number(value ?? 0) || 0;

const categoryMap: Record<string, PemaRequest["category"]> = {
  training: "training",
  research: "research",
  student_activity: "student_activity",
  procurement: "procurement",
  service: "service",
};

function uiStatus(status: string): RequestStatus {
  if (status === "DRAFT") return "draft";
  if (status === "RETURNED") return "returned";
  if (status === "FULLY_APPROVED") return "approved";
  if (status === "CANCELLED") return "rejected";
  return "pending_approval";
}

function roleLabel(role: string): string {
  return {
    STAFF: "ผู้จัดทำคำขอ",
    FINANCE: "ฝ่ายการเงิน",
    DIRECTOR: "ผู้อำนวยการ",
    DEAN: "คณบดี",
    VICE_RECTOR: "รองอธิการบดี",
    RECTOR: "อธิการบดี",
    ADMIN: "ผู้ดูแลระบบ",
  }[role] || role;
}

function timelineStatus(action: string, requestStatus: string): "completed" | "current" | "pending" | "returned" | "rejected" {
  if (action === "returned" || requestStatus === "RETURNED") return "returned";
  if (action === "rejected" || requestStatus === "CANCELLED") return "rejected";
  if (action === "approved" || action === "submitted" || action === "draft_saved") return "completed";
  return "current";
}

function mapDisbursement(value: BackendDisbursement, request?: PemaRequest): DisbursementRecord {
  const amount = toNumber(value.amount);
  const approved = request?.totalBudget ?? 0;
  return {
    id: value.id,
    disbursementCode: value.number,
    requestId: value.requestId,
    requestCode: request?.code ?? "",
    projectTitle: request?.title ?? "",
    department: request?.department ?? "",
    requesterName: request?.requesterName ?? "",
    status: value.status === "APPROVED" ? "paid" : value.status === "RETURNED" ? "rejected" : "under_review",
    totalApprovedBudget: approved,
    totalActualAmount: amount,
    remainingBalance: Math.max(approved - amount, 0),
    payeeName: "",
    bankAccount: "",
    items: [],
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    note: value.note ?? undefined,
  };
}

function mapRequest(value: BackendRequest): PemaRequest {
  const status = uiStatus(value.status);
  const request: PemaRequest = {
    id: value.id,
    code: value.requestNo,
    title: value.projectName,
    category: categoryMap[value.projectType] ?? "service",
    department: value.organizerDepartment,
    faculty: value.venueType || "มหาวิทยาลัยขอนแก่น",
    requesterName: value.createdBy.name,
    requesterRole: roleLabel(value.createdBy.role),
    requesterEmail: value.createdBy.email ?? "",
    requesterPhone: value.contactPhone ?? "",
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    status,
    version: value.version,
    startDate: value.startDate ?? value.createdAt,
    endDate: value.endDate ?? value.startDate ?? value.createdAt,
    location: value.location ?? "",
    targetAudienceCount: value.participants ?? 0,
    objectives: splitLines(value.objectives),
    rationale: value.rationale ?? "",
    expectedOutcomes: splitLines(value.expectedOutcome),
    strategicPlan: value.strategicIssue ?? "",
    kpiAlignment: value.successIndicator ?? "",
    sustainableGoal: undefined,
    expenses: value.items.map((item): ExpenseItem => ({
      id: item.id,
      category: (item.category as ExpenseItem["category"]) || "other",
      description: item.description ?? "",
      unitPrice: toNumber(item.unitPrice),
      quantity: toNumber(item.quantity),
      unit: item.unit,
      total: toNumber(item.amount),
    })),
    speakers: value.sessions.flatMap((session) => session.speakers.map((speaker): SpeakerItem => ({
      id: speaker.id,
      name: speaker.name,
      position: "",
      organization: "",
      type: speaker.speakerType === "internal" ? "internal" : "external",
      topic: session.topic,
      hours: toNumber(session.hours),
      ratePerHour: toNumber(speaker.hourlyRate),
      totalHonorarium: toNumber(speaker.amount),
    }))),
    attachments: value.attachments.map((attachment) => ({
      id: attachment.id,
      fileName: attachment.fileName,
      fileSize: `${Math.ceil(attachment.sizeBytes / 1024)} KB`,
      fileType: attachment.mimeType,
      uploadedAt: attachment.createdAt,
      category: "other",
    })),
    totalBudget: toNumber(value.grandTotal),
    timeline: value.approvalEvents.map((event) => ({
      id: event.id,
      stepName: event.action === "returned" ? "ส่งกลับให้แก้ไข" : event.action === "approved" ? "อนุมัติคำขอ" : event.action === "submitted" ? "ยื่นเสนอคำขอ" : "บันทึกคำขอ",
      actorName: event.actor.name,
      actorRole: roleLabel(event.actor.role),
      status: timelineStatus(event.action, value.status),
      timestamp: event.createdAt,
      comment: event.reason ?? undefined,
    })),
    returnReason: status === "returned" ? value.approvalEvents.find((event) => event.action === "returned")?.reason ?? undefined : undefined,
    allowedActions: status === "draft" || status === "returned" ? ["edit", "submit", "cancel"] : [],
  };
  return request;
}

function toApiInput(request: Partial<PemaRequest>): BackendRequestInput {
  const today = new Date().toISOString().slice(0, 10);
  return {
    projectName: request.title?.trim() || "โครงการไม่มีชื่อ",
    projectType: request.category || "service",
    organizerDepartment: request.department?.trim() || "หน่วยงานผู้จัดทำ",
    contactPhone: request.requesterPhone || undefined,
    startDate: request.startDate || today,
    endDate: request.endDate || request.startDate || today,
    location: request.location?.trim() || "มหาวิทยาลัยขอนแก่น",
    venueType: request.faculty || "onsite",
    participants: Math.max(1, Math.round(request.targetAudienceCount || 1)),
    attendanceFeeMode: "none",
    inPlan: true,
    strategicIssue: request.strategicPlan || undefined,
    rationale: request.rationale || undefined,
    objectives: request.objectives?.join("\n") || undefined,
    targetGroup: request.targetAudienceCount ? `ผู้เข้าร่วมโครงการ ${request.targetAudienceCount} คน` : undefined,
    expectedOutcome: request.expectedOutcomes?.join("\n") || undefined,
    successIndicator: request.kpiAlignment || undefined,
    items: (request.expenses || []).map((item) => ({
      category: item.category,
      description: item.description,
      quantity: Math.max(0.01, Number(item.quantity) || 0.01),
      unit: item.unit || "รายการ",
      unitPrice: Math.max(0, Number(item.unitPrice) || 0),
    })),
  };
}

export const RequestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [requests, setRequests] = useState<PemaRequest[]>([]);
  const [disbursements, setDisbursements] = useState<DisbursementRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const replaceRequest = useCallback((next: PemaRequest) => {
    setRequests((current) => [next, ...current.filter((item) => item.id !== next.id)]);
  }, []);

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await pemaApi.listRequests("page=1&pageSize=100");
      const detailRequests = await Promise.all(result.data.map((item) => pemaApi.getRequest(item.id)));
      const mapped = detailRequests.map(mapRequest);
      setRequests(mapped);
      setDisbursements(detailRequests.flatMap((raw, index) => raw.disbursements.map((item) => mapDisbursement(item, mapped[index]))));
    } catch (cause) {
      const message = cause instanceof ApiClientError ? cause.message : "ไม่สามารถโหลดข้อมูลจากระบบได้";
      setError(message);
      setRequests([]);
      setDisbursements([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadRequests();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadRequests]);

  const getRequestById = useCallback((id: string) => requests.find((item) => item.id === id || item.code === id), [requests]);

  const getRequestByIdAsync = useCallback(async (id: string) => {
    const cached = getRequestById(id);
    if (cached) return cached;
    try {
      const loaded = mapRequest(await pemaApi.getRequest(id));
      replaceRequest(loaded);
      return loaded;
    } catch {
      return undefined;
    }
  }, [getRequestById, replaceRequest]);

  const getDisbursementById = useCallback((id: string) => disbursements.find((item) => item.id === id || item.disbursementCode === id), [disbursements]);

  const createRequest = useCallback(async (newReq: Partial<PemaRequest>) => {
    const created = await pemaApi.createRequest(toApiInput(newReq));
    const submitted = newReq.status === "draft" ? created : await pemaApi.submitRequest(created.id);
    const mapped = mapRequest(submitted);
    replaceRequest(mapped);
    return mapped;
  }, [replaceRequest]);

  const updateRequest = useCallback(async (id: string, updated: Partial<PemaRequest>) => {
    const current = getRequestById(id);
    if (!current?.version) throw new Error("ข้อมูลคำขอไม่พร้อมสำหรับการแก้ไข");
    const updatedValue = await pemaApi.updateRequest(id, { ...toApiInput({ ...current, ...updated }), version: current.version });
    const submitted = updated.status && updated.status !== "draft" ? await pemaApi.submitRequest(id) : updatedValue;
    const mapped = mapRequest(submitted);
    replaceRequest(mapped);
    return mapped;
  }, [getRequestById, replaceRequest]);

  const updateRequestStatus = useCallback(async (id: string, status: PemaRequest["status"], comment?: string) => {
    const current = getRequestById(id);
    if (!current?.version) throw new Error("ข้อมูลคำขอไม่พร้อมสำหรับการพิจารณา");
    if (status !== "approved" && status !== "returned") throw new Error("ระบบรองรับเฉพาะอนุมัติหรือส่งกลับแก้ไข");
    const result = await pemaApi.reviewRequest(id, {
      version: current.version,
      decision: status === "approved" ? "approve" : "return",
      reason: comment,
    });
    const mapped = mapRequest(result);
    replaceRequest(mapped);
    return mapped;
  }, [getRequestById, replaceRequest]);

  const deleteRequest = useCallback(async () => {
    throw new Error("การยกเลิกคำขอยังไม่เปิดใน API รุ่นนี้");
  }, []);

  const createDisbursement = useCallback(async (newDisb: Partial<DisbursementRecord>) => {
    const request = getRequestById(newDisb.requestId || "");
    if (!request?.version) throw new Error("ไม่พบคำขอที่พร้อมสำหรับการเบิกจ่าย");
    const result = await pemaApi.createDisbursement(request.id, {
      version: request.version,
      amount: Number(newDisb.totalActualAmount) || 0,
      note: newDisb.note,
    });
    const mapped = mapDisbursement(result, request);
    setDisbursements((current) => [mapped, ...current.filter((item) => item.id !== mapped.id)]);
    return mapped;
  }, [getRequestById]);

  return (
    <RequestContext.Provider value={{
      requests,
      disbursements,
      isLoading,
      error,
      getRequestById,
      getRequestByIdAsync,
      getDisbursementById,
      createRequest,
      updateRequest,
      updateRequestStatus,
      deleteRequest,
      createDisbursement,
    }}>
      {children}
    </RequestContext.Provider>
  );
};

export const usePema = () => {
  const context = useContext(RequestContext);
  if (!context) throw new Error("usePema must be used within a RequestProvider");
  return context;
};
