"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { PemaRequest, DisbursementRecord, ApprovalTimelineItem } from "../types/pema";
import { initialRequests } from "../mock-data/requests";
import { initialDisbursements } from "../mock-data/disbursements";

interface RequestContextType {
  requests: PemaRequest[];
  disbursements: DisbursementRecord[];
  getRequestById: (id: string) => PemaRequest | undefined;
  getDisbursementById: (id: string) => DisbursementRecord | undefined;
  createRequest: (newReq: Partial<PemaRequest>) => PemaRequest;
  updateRequest: (id: string, updated: Partial<PemaRequest>) => void;
  updateRequestStatus: (id: string, status: PemaRequest["status"], comment?: string) => void;
  deleteRequest: (id: string) => void;
  createDisbursement: (newDisb: Partial<DisbursementRecord>) => DisbursementRecord;
}

const RequestContext = createContext<RequestContextType | undefined>(undefined);

export const RequestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [requests, setRequests] = useState<PemaRequest[]>(initialRequests);
  const [disbursements, setDisbursements] = useState<DisbursementRecord[]>(initialDisbursements);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage if present
  useEffect(() => {
    try {
      const savedRequests = localStorage.getItem("pema_requests");
      if (savedRequests) {
        setRequests(JSON.parse(savedRequests));
      }
      const savedDisb = localStorage.getItem("pema_disbursements");
      if (savedDisb) {
        setDisbursements(JSON.parse(savedDisb));
      }
    } catch (e) {
      console.warn("Could not read localStorage", e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("pema_requests", JSON.stringify(requests));
      localStorage.setItem("pema_disbursements", JSON.stringify(disbursements));
    } catch (e) {
      console.warn("Could not write localStorage", e);
    }
  }, [requests, disbursements, isLoaded]);

  const getRequestById = (id: string) => {
    return requests.find((r) => r.id === id || r.code === id);
  };

  const getDisbursementById = (id: string) => {
    return disbursements.find((d) => d.id === id || d.disbursementCode === id);
  };

  const createRequest = (newReq: Partial<PemaRequest>): PemaRequest => {
    const nextNum = requests.length + 1;
    const code = `REQ-2569-${String(nextNum).padStart(4, "0")}`;
    const id = `req-${Date.now()}`;
    const now = new Date().toISOString();

    const created: PemaRequest = {
      id,
      code,
      title: newReq.title || "โครงการไม่มีชื่อ",
      category: newReq.category || "training",
      department: newReq.department || "กองนโยบายและแผน",
      faculty: newReq.faculty || "มหาวิทยาลัย",
      requesterName: newReq.requesterName || "ผู้ใช้งานระบบ",
      requesterRole: newReq.requesterRole || "บุคลากร",
      requesterEmail: newReq.requesterEmail || "user@univ.ac.th",
      requesterPhone: newReq.requesterPhone || "02-123-4567",
      createdAt: now,
      updatedAt: now,
      status: newReq.status || "pending_approval",
      startDate: newReq.startDate || new Date().toISOString().split("T")[0],
      endDate: newReq.endDate || new Date().toISOString().split("T")[0],
      location: newReq.location || "มหาวิทยาลัย",
      targetAudienceCount: newReq.targetAudienceCount || 30,
      objectives: newReq.objectives || [],
      rationale: newReq.rationale || "",
      expectedOutcomes: newReq.expectedOutcomes || [],
      strategicPlan: newReq.strategicPlan || "ยุทธศาสตร์ที่ 1: การพลิกโฉมการศึกษา",
      kpiAlignment: newReq.kpiAlignment || "KPI 1.1",
      sustainableGoal: newReq.sustainableGoal || "SDG 4: Quality Education",
      expenses: newReq.expenses || [],
      speakers: newReq.speakers || [],
      attachments: newReq.attachments || [],
      totalBudget: newReq.totalBudget || 0,
      timeline: [
        {
          id: `tl-${Date.now()}`,
          stepName: newReq.status === "draft" ? "บันทึกฉบับร่าง" : "ยื่นเสนอคำขอโครงการ",
          actorName: newReq.requesterName || "ผู้ใช้งานระบบ",
          actorRole: "ผู้จัดทำคำขอ",
          status: "completed" as const,
          timestamp: new Date().toLocaleString("th-TH"),
          comment: newReq.status === "draft" ? "บันทึกฉบับร่างในระบบ" : "ยื่นคำขออนุมัติโครงการ",
        },
      ],
      allowedActions: newReq.status === "draft" ? ["edit", "submit", "cancel"] : ["approve", "return", "reject"],
      ...newReq,
    };

    setRequests((prev) => [created, ...prev]);
    return created;
  };

  const updateRequest = (id: string, updated: Partial<PemaRequest>) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updated, updatedAt: new Date().toISOString() } : r))
    );
  };

  const updateRequestStatus = (id: string, status: PemaRequest["status"], comment?: string) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;

        let newReturnReason = r.returnReason;
        if (status === "returned") {
          newReturnReason = comment || "กรุณาแก้ไขข้อมูลตามข้อสังเกต";
        } else if (status === "approved" || status === "pending_approval") {
          newReturnReason = undefined;
        }

        const stepStatus: ApprovalTimelineItem["status"] =
          status === "returned"
            ? "returned"
            : status === "rejected"
            ? "rejected"
            : "completed";

        const newTimelineStep: ApprovalTimelineItem = {
          id: `tl-${Date.now()}`,
          stepName:
            status === "approved"
              ? "อนุมัติโครงการ"
              : status === "returned"
              ? "ส่งกลับให้แก้ไข"
              : status === "rejected"
              ? "ไม่อนุมัติโครงการ"
              : "ยื่นเสนอคำขอใหม่",
          actorName: "ผู้พิจารณาอนุมัติ / ฝ่ายงบประมาณ",
          actorRole: "ผู้อนุมัติ",
          status: stepStatus,
          timestamp: new Date().toLocaleString("th-TH"),
          comment: comment,
        };

        return {
          ...r,
          status,
          returnReason: newReturnReason,
          updatedAt: new Date().toISOString(),
          timeline: [...r.timeline, newTimelineStep],
        };
      })
    );
  };

  const deleteRequest = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const createDisbursement = (newDisb: Partial<DisbursementRecord>): DisbursementRecord => {
    const nextNum = disbursements.length + 1;
    const code = `DISB-2569-${String(nextNum).padStart(4, "0")}`;
    const id = `disb-${Date.now()}`;
    const now = new Date().toISOString();

    const created: DisbursementRecord = {
      id,
      disbursementCode: code,
      requestId: newDisb.requestId || "",
      requestCode: newDisb.requestCode || "",
      projectTitle: newDisb.projectTitle || "",
      department: newDisb.department || "",
      requesterName: newDisb.requesterName || "",
      status: newDisb.status || "under_review",
      totalApprovedBudget: newDisb.totalApprovedBudget || 0,
      totalActualAmount: newDisb.totalActualAmount || 0,
      remainingBalance: (newDisb.totalApprovedBudget || 0) - (newDisb.totalActualAmount || 0),
      payeeName: newDisb.payeeName || "",
      bankAccount: newDisb.bankAccount || "",
      items: newDisb.items || [],
      createdAt: now,
      updatedAt: now,
      note: newDisb.note,
    };

    setDisbursements((prev) => [created, ...prev]);

    // Also update request status to disbursed if paid/processed
    if (newDisb.requestId) {
      updateRequest(newDisb.requestId, { status: "disbursed" });
    }

    return created;
  };

  return (
    <RequestContext.Provider
      value={{
        requests,
        disbursements,
        getRequestById,
        getDisbursementById,
        createRequest,
        updateRequest,
        updateRequestStatus,
        deleteRequest,
        createDisbursement,
      }}
    >
      {children}
    </RequestContext.Provider>
  );
};

export const usePema = () => {
  const context = useContext(RequestContext);
  if (!context) {
    throw new Error("usePema must be used within a RequestProvider");
  }
  return context;
};
