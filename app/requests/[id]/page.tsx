"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { usePema } from "@/lib/context/RequestContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TotalsSummary } from "@/components/domain/TotalsSummary";
import { ExpenseItemArray } from "@/components/domain/ExpenseItemArray";
import { SpeakerItemArray } from "@/components/domain/SpeakerItemArray";
import { ApprovalTimeline } from "@/components/domain/ApprovalTimeline";
import { AttachmentList } from "@/components/domain/AttachmentList";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatDateThai } from "@/lib/utils";
import {
  Calendar,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  Target,
  FileEdit,
  CheckCircle2,
  AlertCircle,
  Banknote,
  Printer,
  ChevronLeft,
  Share2,
} from "lucide-react";

export default function RequestDetailPage() {
  const params = useParams();
  const { getRequestById, updateRequestStatus } = usePema();

  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);
  const request = getRequestById(id);

  // Dialog States
  const [activeAction, setActiveAction] = useState<"approve" | "return" | "reject" | "cancel" | null>(null);
  const [returnComment, setReturnComment] = useState("");
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  if (!request) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-brand-text">ไม่พบข้อมูลคำขอ</h2>
        <p className="text-sm text-brand-muted">คำขอรหัส &quot;{id}&quot; อาจถูกลบหรือไม่เคยมีอยู่ในระบบ</p>
        <Link
          href="/requests"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary text-white text-sm font-semibold"
        >
          <ChevronLeft className="w-4 h-4" /> กลับสู่หน้ารายการคำขอ
        </Link>
      </div>
    );
  }

  const handleActionConfirm = async () => {
    if (!activeAction) return;
    setIsSubmittingAction(true);

    try {
      if (activeAction === "approve") {
        await updateRequestStatus(request.id, "approved", "อนุมัติคำขอโครงการและงบประมาณเรียบร้อย");
      } else if (activeAction === "return") {
        await updateRequestStatus(request.id, "returned", returnComment || "กรุณาแก้ไขรายละเอียดคำขอตามข้อสังเกต");
      }

      setActiveAction(null);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Page Header */}
      <PageHeader
        title={request.title}
        subtitle={`รหัสคำขอ: ${request.code} • ยื่นเมื่อวันที่ ${formatDateThai(request.createdAt)}`}
        backHref="/requests"
        badge={<StatusBadge status={request.status} size="md" />}
        breadcrumbs={[
          { label: "หน้าแรก", href: "/" },
          { label: "รายการคำขอ", href: "/requests" },
          { label: request.code },
        ]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {/* If returned or draft -> Edit button */}
            {(request.status === "returned" || request.status === "draft") && (
              <Link
                href={`/requests/create?editId=${request.id}`}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-all focus-ring touch-target"
              >
                <FileEdit className="w-4 h-4" /> แก้ไขข้อมูลคำขอ
              </Link>
            )}

            {/* If pending -> Approve / Return actions */}
            {request.status === "pending_approval" && request.allowedActions.includes("approve") && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveAction("approve")}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-all focus-ring touch-target"
                >
                  <CheckCircle2 className="w-4 h-4" /> อนุมัติคำขอ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReturnComment("");
                    setActiveAction("return");
                  }}
                  className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-all focus-ring touch-target"
                >
                  <AlertCircle className="w-4 h-4" /> ส่งกลับแก้ไข
                </button>
              </>
            )}

            {/* If approved -> Disburse CTA */}
            {request.status === "approved" && (
              <Link
                href={`/disbursements/create?requestId=${request.id}`}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-all focus-ring touch-target"
              >
                <Banknote className="w-4 h-4" /> บันทึกเบิกจ่าย
              </Link>
            )}

            {/* Print / Export button */}
            <button
              type="button"
              onClick={() => window.print()}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors focus-ring touch-target flex items-center justify-center"
              aria-label="พิมพ์เอกสารคำขอ"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        }
      />

      {/* Return Reason Alert Banner (Section 5 #3) */}
      {request.status === "returned" && request.returnReason && (
        <div className="p-4 sm:p-5 rounded-2xl border-2 border-orange-300 bg-orange-50 text-orange-950 shadow-sm flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm sm:text-base text-orange-950">
              คำขอนี้ถูกส่งกลับเพื่อให้ปรับปรุงแก้ไข
            </h4>
            <p className="text-xs sm:text-sm text-orange-900 mt-1 leading-relaxed">
              {request.returnReason}
            </p>
            <div className="mt-3">
              <Link
                href={`/requests/create?editId=${request.id}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-xs"
              >
                <FileEdit className="w-3.5 h-3.5" /> เข้าสู่ฟอร์มเพื่อแก้ไข
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 2-Column Responsive Layout (Desktop Main Content + Right Rail) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content (2 cols on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Project Information Card */}
          <SectionCard title="ข้อมูลทั่วไปของโครงการ" icon={Building}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-brand-muted">หน่วยงาน / ภาควิชา</p>
                <p className="font-semibold text-brand-text mt-0.5">{request.department}</p>
                <p className="text-xs text-slate-500">{request.faculty}</p>
              </div>

              <div>
                <p className="text-xs text-brand-muted">สถานที่จัดโครงการ</p>
                <p className="font-semibold text-brand-text mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {request.location}
                </p>
              </div>

              <div>
                <p className="text-xs text-brand-muted">ระยะเวลาดำเนินโครงการ</p>
                <p className="font-semibold text-brand-text mt-0.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {formatDateThai(request.startDate)} ถึง {formatDateThai(request.endDate)}
                </p>
              </div>

              <div>
                <p className="text-xs text-brand-muted">จำนวนกลุ่มเป้าหมายผู้เข้าร่วม</p>
                <p className="font-semibold text-brand-text mt-0.5 font-mono">
                  {request.targetAudienceCount} คน
                </p>
              </div>
            </div>

            {/* Objectives */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <p className="text-xs font-bold text-brand-text uppercase tracking-wider mb-2">
                วัตถุประสงค์โครงการ
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-slate-700">
                {request.objectives.map((obj, i) => (
                  <li key={i}>{obj}</li>
                ))}
              </ul>
            </div>

            {/* Rationale */}
            {request.rationale && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-brand-text uppercase tracking-wider mb-1.5">
                  หลักการและเหตุผล
                </p>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {request.rationale}
                </p>
              </div>
            )}
          </SectionCard>

          {/* 2. Strategic Alignment */}
          <SectionCard title="ความสอดคล้องเชิงยุทธศาสตร์และแผนงาน" icon={Target}>
            <div className="space-y-3 text-sm">
              <div className="p-3 rounded-xl bg-brand-primary/5 border border-brand-primary/15">
                <p className="text-xs font-bold text-brand-primary">ยุทธศาสตร์มหาวิทยาลัย / องค์กร</p>
                <p className="text-xs sm:text-sm text-brand-text font-medium mt-0.5">
                  {request.strategicPlan}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-xs font-bold text-slate-700">ตัวชี้วัด (KPIs)</p>
                  <p className="text-xs text-slate-600 mt-0.5">{request.kpiAlignment}</p>
                </div>
                {request.sustainableGoal && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-xs font-bold text-slate-700">เป้าหมายการพัฒนาที่ยั่งยืน (SDGs)</p>
                    <p className="text-xs text-slate-600 mt-0.5">{request.sustainableGoal}</p>
                  </div>
                )}
              </div>
            </div>
          </SectionCard>

          {/* 3. Expense Breakdown Table */}
          <SectionCard title="รายการค่าใช้จ่ายและงบประมาณ" icon={Banknote}>
            <ExpenseItemArray items={request.expenses} onChange={() => {}} readOnly={true} />
          </SectionCard>

          {/* 4. Speakers & Trainers */}
          {request.speakers && request.speakers.length > 0 && (
            <SectionCard title="รายชื่อวิทยากรและผู้ทรงคุณวุฒิ" icon={User}>
              <SpeakerItemArray items={request.speakers} onChange={() => {}} readOnly={true} />
            </SectionCard>
          )}

          {/* 5. Attachments */}
          <SectionCard title="เอกสารแนบประกอบคำขอ" icon={Share2}>
            <AttachmentList attachments={request.attachments} />
          </SectionCard>
        </div>

        {/* Right Rail: Totals & Approval Timeline */}
        <div className="space-y-6">
          {/* Totals Box */}
          <TotalsSummary expenses={request.expenses} />

          {/* Requester Info Card */}
          <SectionCard title="ผู้รับผิดชอบโครงการ" icon={User}>
            <div className="space-y-2.5 text-xs sm:text-sm">
              <div>
                <p className="font-bold text-brand-text">{request.requesterName}</p>
                <p className="text-xs text-brand-muted">{request.requesterRole}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{request.requesterEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{request.requesterPhone}</span>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Approval Progress Timeline Rail */}
          <SectionCard title="เส้นทางการพิจารณาและอนุมัติ" icon={CheckCircle2}>
            <ApprovalTimeline timeline={request.timeline} />
          </SectionCard>
        </div>
      </div>

      {/* Confirmation Dialogs for Allowed Actions */}
      <ConfirmDialog
        isOpen={activeAction === "approve"}
        onClose={() => setActiveAction(null)}
        onConfirm={handleActionConfirm}
        title="ยืนยันการอนุมัติคำขอโครงการ?"
        description={`คุณต้องการอนุมัติโครงการ "${request.title}" วงเงินงบประมาณ ฿${request.totalBudget.toLocaleString()} ใช่หรือไม่?`}
        confirmLabel="อนุมัติโครงการ"
        variant="success"
        isLoading={isSubmittingAction}
      />

      <ConfirmDialog
        isOpen={activeAction === "return"}
        onClose={() => setActiveAction(null)}
        onConfirm={handleActionConfirm}
        title="ระบุเหตุผลในการส่งกลับแก้ไข"
        description="กรุณาระบุข้อสังเกตและรายการที่ต้องการให้ผู้ยื่นคำขอปรับปรุงแก้ไข:"
        confirmLabel="ส่งกลับแก้ไข"
        variant="warning"
        isLoading={isSubmittingAction}
      >
        <textarea
          rows={3}
          value={returnComment}
          onChange={(e) => setReturnComment(e.target.value)}
          placeholder="เช่น กรุณาปรับปรุงรายการค่าอาหารว่างไม่เกิน 50 บ./คน และแนบไฟล์ TOR เพิ่มเติม..."
          className="w-full mt-2 p-3 text-xs sm:text-sm rounded-xl border border-slate-300 focus-ring"
        />
      </ConfirmDialog>
    </div>
  );
}
