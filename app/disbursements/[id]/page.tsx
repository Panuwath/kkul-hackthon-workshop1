"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { usePema } from "@/lib/context/RequestContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MoneyValue } from "@/components/ui/MoneyValue";
import { formatDateThai } from "@/lib/utils";
import { Banknote, Building, User, FileText, CheckCircle2, ChevronLeft, Printer } from "lucide-react";

export default function DisbursementDetailPage() {
  const params = useParams();
  const { getDisbursementById } = usePema();

  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);
  const disbursement = getDisbursementById(id);

  if (!disbursement) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-brand-text">ไม่พบรายการเบิกจ่าย</h2>
        <p className="text-sm text-brand-muted">รหัส "{id}" ไม่มีอยู่ในระบบ</p>
        <Link
          href="/disbursements"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary text-white text-sm font-semibold"
        >
          <ChevronLeft className="w-4 h-4" /> กลับสู่หน้ารายการเบิกจ่าย
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title={`ใบขอเบิกจ่าย: ${disbursement.disbursementCode}`}
        subtitle={`อ้างอิงโครงการ: ${disbursement.requestCode} • บันทึกเมื่อวันที่ ${formatDateThai(disbursement.createdAt)}`}
        backHref="/disbursements"
        badge={<StatusBadge status={disbursement.status} size="md" />}
        breadcrumbs={[
          { label: "หน้าแรก", href: "/" },
          { label: "ระบบเบิกจ่าย", href: "/disbursements" },
          { label: disbursement.disbursementCode },
        ]}
        actions={
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold shadow-xs flex items-center gap-1.5 focus-ring"
          >
            <Printer className="w-4 h-4" /> พิมพ์ใบขอเบิกเงิน
          </button>
        }
      />

      {/* Project & Payee Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionCard title="ข้อมูลโครงการที่อ้างอิง" icon={Building}>
          <div className="space-y-2 text-xs sm:text-sm">
            <p className="font-bold text-brand-text text-base">{disbursement.projectTitle}</p>
            <p className="text-brand-muted">รหัสคำขอ: <span className="font-mono text-brand-primary font-bold">{disbursement.requestCode}</span></p>
            <p className="text-brand-muted">หน่วยงาน: {disbursement.department}</p>
            <p className="text-brand-muted">ผู้รับผิดชอบโครงการ: {disbursement.requesterName}</p>
          </div>
        </SectionCard>

        <SectionCard title="ข้อมูลการจ่ายเงิน" icon={User}>
          <div className="space-y-2 text-xs sm:text-sm">
            <p className="text-brand-muted">ผู้รับเงิน: <span className="font-bold text-brand-text">{disbursement.payeeName}</span></p>
            <p className="text-brand-muted">บัญชีธนาคาร: <span className="font-mono">{disbursement.bankAccount}</span></p>
            {disbursement.paidAt && (
              <p className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> โอนเงินเรียบร้อยเมื่อ {formatDateThai(disbursement.paidAt)}
              </p>
            )}
            {disbursement.note && (
              <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 mt-2">
                หมายเหตุ: {disbursement.note}
              </p>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Items Table */}
      <SectionCard title="รายการใบเสร็จรับเงินและการเบิกจ่ายจริง" icon={Banknote}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-brand-muted uppercase">
              <tr>
                <th className="py-3.5 px-4">#</th>
                <th className="py-3.5 px-4">รายละเอียดค่าใช้จ่าย</th>
                <th className="py-3.5 px-4">เลขที่ใบเสร็จ</th>
                <th className="py-3.5 px-4">ร้านค้า / ผู้รับเงิน</th>
                <th className="py-3.5 px-4 text-right">งบอนุมัติ (฿)</th>
                <th className="py-3.5 px-4 text-right">จ่ายจริง (฿)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {disbursement.items.map((item, index) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-400">{index + 1}</td>
                  <td className="py-3.5 px-4 font-medium text-brand-text">{item.description}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-600">{item.invoiceNo}</td>
                  <td className="py-3.5 px-4 text-xs text-slate-600">{item.vendorName}</td>
                  <td className="py-3.5 px-4 text-right"><MoneyValue amount={item.budgetAllocated} size="sm" /></td>
                  <td className="py-3.5 px-4 text-right"><MoneyValue amount={item.actualAmount} size="sm" highlight /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div>
            <span className="text-xs text-brand-muted block">งบประมาณที่อนุมัติ</span>
            <MoneyValue amount={disbursement.totalApprovedBudget} size="lg" className="font-bold text-slate-800 mt-1" />
          </div>
          <div>
            <span className="text-xs text-brand-muted block">ยอดเบิกจ่ายจริงตามใบเสร็จ</span>
            <MoneyValue amount={disbursement.totalActualAmount} size="lg" highlight className="font-bold text-brand-primary mt-1" />
          </div>
          <div>
            <span className="text-xs text-emerald-800 font-semibold block">งบคงเหลือคืนสถาบัน</span>
            <MoneyValue amount={disbursement.remainingBalance} size="lg" className="font-bold text-emerald-700 mt-1" />
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
