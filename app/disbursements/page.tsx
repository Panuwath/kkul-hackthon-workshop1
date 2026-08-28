"use client";

import React from "react";
import Link from "next/link";
import { usePema } from "@/lib/context/RequestContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MoneyValue } from "@/components/ui/MoneyValue";
import { formatDateThai } from "@/lib/utils";
import { Banknote, Plus, ChevronRight, CheckCircle2, ArrowUpRight } from "lucide-react";

export default function DisbursementListPage() {
  const { disbursements, requests } = usePema();
  const filter = "all";

  const approvedRequests = requests.filter((r) => r.status === "approved");

  const filteredDisb = disbursements.filter((d) => {
    if (filter === "all") return true;
    return d.status === filter;
  });

  const totalDisbursed = disbursements
    .filter((d) => d.status === "paid")
    .reduce((sum, d) => sum + d.totalActualAmount, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="ระบบเบิกจ่ายงบประมาณ"
        subtitle="บันทึกและติดตามการเบิกจ่ายงบประมาณตามใบเสร็จจริง จากโครงการที่ได้รับการอนุมัติแล้ว"
        breadcrumbs={[
          { label: "หน้าแรก", href: "/" },
          { label: "ระบบเบิกจ่ายงบประมาณ" },
        ]}
        actions={
          <Link
            href="/disbursements/create"
            className="px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs sm:text-sm font-semibold shadow-sm transition-all flex items-center gap-1.5 focus-ring touch-target"
          >
            <Plus className="w-4 h-4" /> บันทึกการเบิกจ่ายใหม่
          </Link>
        }
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-m3">
          <span className="text-xs font-semibold text-brand-muted">ยอดเบิกจ่ายจริงทั้งหมด</span>
          <MoneyValue amount={totalDisbursed} size="xl" highlight className="font-extrabold text-emerald-700 mt-2 block" />
          <span className="text-[11px] text-emerald-700 mt-1 block">จ่ายตามใบเสร็จรับเงินแล้ว</span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-m3">
          <span className="text-xs font-semibold text-brand-muted">โครงการที่รอเบิกจ่าย</span>
          <p className="text-2xl font-extrabold text-brand-primary mt-1 font-mono">
            {approvedRequests.length} โครงการ
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">ผ่านการอนุมัติแล้ว</span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-m3">
          <span className="text-xs font-semibold text-brand-muted">รายการเบิกจ่ายสะสม</span>
          <p className="text-2xl font-extrabold text-brand-text mt-1 font-mono">
            {disbursements.length} รายการ
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">ในระบบทั้งหมด</span>
        </div>
      </div>

      {/* Approved Projects Ready for Disbursement Banner */}
      {approvedRequests.length > 0 && (
        <div className="p-5 rounded-2xl border border-brand-primary/20 bg-brand-primary/5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-brand-primary" />
              <h3 className="font-bold text-sm sm:text-base text-brand-text">
                โครงการที่อนุมัติแล้ว พร้อมดำเนินการเบิกจ่าย ({approvedRequests.length})
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {approvedRequests.map((req) => (
              <div
                key={req.id}
                className="p-3.5 rounded-xl border border-brand-primary/20 bg-white flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="min-w-0">
                  <span className="text-[11px] font-mono font-bold text-brand-primary">
                    {req.code}
                  </span>
                  <p className="text-xs font-bold text-brand-text truncate mt-0.5">
                    {req.title}
                  </p>
                  <p className="text-[11px] text-brand-muted mt-0.5">
                    งบประมาณอนุมัติ: ฿{req.totalBudget.toLocaleString()}
                  </p>
                </div>
                <Link
                  href={`/disbursements/create?requestId=${req.id}`}
                  className="px-3 py-1.5 rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold flex items-center gap-1 flex-shrink-0 focus-ring touch-target"
                >
                  เบิกจ่าย <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disbursements List Table */}
      <SectionCard title="ประวัติและรายการเบิกจ่ายงบประมาณ" icon={Banknote}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-brand-muted uppercase">
              <tr>
                <th className="py-3.5 px-4">รหัสการเบิกจ่าย</th>
                <th className="py-3.5 px-4">โครงการ</th>
                <th className="py-3.5 px-4 text-center">สถานะ</th>
                <th className="py-3.5 px-4 text-right">งบอนุมัติ (฿)</th>
                <th className="py-3.5 px-4 text-right">เบิกจ่ายจริง (฿)</th>
                <th className="py-3.5 px-4 text-right">งบคงเหลือ (฿)</th>
                <th className="py-3.5 px-4 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDisb.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-4 font-mono text-xs font-bold text-brand-primary">
                    <Link href={`/disbursements/${d.id}`} className="hover:underline">
                      {d.disbursementCode}
                    </Link>
                    <p className="text-[11px] text-brand-muted font-sans font-normal mt-0.5">
                      {formatDateThai(d.createdAt)}
                    </p>
                  </td>

                  <td className="py-4 px-4">
                    <Link
                      href={`/disbursements/${d.id}`}
                      className="font-semibold text-brand-text hover:text-brand-primary block text-xs sm:text-sm line-clamp-1"
                    >
                      {d.projectTitle}
                    </Link>
                    <p className="text-xs text-brand-muted mt-0.5">
                      {d.department} • ผู้เบิก: {d.requesterName}
                    </p>
                  </td>

                  <td className="py-4 px-4 text-center">
                    <StatusBadge status={d.status} size="sm" />
                  </td>

                  <td className="py-4 px-4 text-right">
                    <MoneyValue amount={d.totalApprovedBudget} size="sm" />
                  </td>

                  <td className="py-4 px-4 text-right">
                    <MoneyValue amount={d.totalActualAmount} size="sm" highlight />
                  </td>

                  <td className="py-4 px-4 text-right text-emerald-700 font-mono text-xs font-semibold">
                    <MoneyValue amount={d.remainingBalance} size="sm" />
                  </td>

                  <td className="py-4 px-4 text-center">
                    <Link
                      href={`/disbursements/${d.id}`}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-brand-primary inline-flex items-center justify-center focus-ring"
                      aria-label="ดูรายละเอียดการเบิกจ่าย"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
