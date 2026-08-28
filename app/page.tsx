"use client";

import React from "react";
import Link from "next/link";
import { usePema } from "@/lib/context/RequestContext";
import { getDashboardMetrics } from "@/lib/mock-data/requests";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { MoneyValue } from "@/components/ui/MoneyValue";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RequestTable } from "@/components/domain/RequestTable";
import { RequestCard } from "@/components/domain/RequestCard";
import { formatDateThai } from "@/lib/utils";
import {
  Plus,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Banknote,
  ArrowRight,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

export default function DashboardPage() {
  const { requests } = usePema();
  const metrics = getDashboardMetrics(requests);

  const returnedRequests = requests.filter((r) => r.status === "returned");
  const pendingRequests = requests.filter((r) => r.status === "pending_approval");
  const recentRequests = requests.slice(0, 5);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Welcome & Quick CTA */}
      <div className="bg-gradient-to-r from-brand-primary via-[#8C2E1A] to-brand-secondary rounded-3xl p-6 sm:p-8 text-white shadow-m3-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="bg-white/95 rounded-xl px-2.5 py-1.5 shadow-sm flex items-center">
              <img
                src="/logo.png"
                alt="Khon Kaen University"
                className="h-7 w-auto object-contain"
              />
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-amber-100 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              ระบบบริหารโครงการและงบประมาณ PEMA
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            สวัสดี, ดร. กิตติศักดิ์ พรหมมินทร์
          </h1>
          <p className="text-stone-100 text-xs sm:text-sm mt-2 leading-relaxed max-w-xl">
            ยินดีต้อนรับสู่ระบบบริหารโครงการ ตรวจสอบคำขอที่ต้องดำเนินการเร่งด่วนและติดตามสถานะงบประมาณได้ที่นี่
          </p>

          <div className="flex items-center gap-3 mt-6 flex-wrap">
            <Link
              href="/requests/create"
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 focus-ring touch-target active:scale-95"
            >
              <Plus className="w-4 h-4" /> สร้างคำขอโครงการใหม่
            </Link>
            <Link
              href="/requests"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm backdrop-blur-sm transition-all border border-white/20 flex items-center gap-1.5 focus-ring touch-target"
            >
              ดูรายการทั้งหมด <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Decorative subtle background circle */}
        <div className="absolute -right-12 -bottom-16 w-72 h-72 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* UX RULE (Section 5 #1): ผู้ใช้เปิด dashboard และเห็น "งานที่ต้องทำ" ก่อนตัวเลขรวม */}
      {metrics.actionRequiredItems.length > 0 && (
        <section aria-labelledby="urgent-tasks-title" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
              <h2
                id="urgent-tasks-title"
                className="text-base sm:text-lg font-bold text-brand-text flex items-center gap-2"
              >
                งานที่ต้องดำเนินการเร่งด่วน
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-900">
                  {metrics.actionRequiredItems.length} รายการ
                </span>
              </h2>
            </div>
            <span className="text-xs text-brand-muted hidden sm:inline">
              ต้องดำเนินการแก้ไขหรือพิจารณา
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {returnedRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 sm:p-5 rounded-2xl border-2 border-orange-200 bg-orange-50/70 shadow-sm flex flex-col justify-between gap-3 transition-all hover:border-orange-300"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-orange-900">
                      {req.code}
                    </span>
                    <StatusBadge status="returned" size="sm" />
                  </div>
                  <h4 className="font-bold text-sm text-brand-text line-clamp-2">
                    {req.title}
                  </h4>
                  {req.returnReason && (
                    <p className="text-xs text-orange-900 bg-white/90 p-2.5 rounded-xl border border-orange-200 leading-relaxed font-medium">
                      ⚠️ {req.returnReason}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-orange-200/60 text-xs">
                  <span className="text-slate-600 font-mono">
                    ยอดเงิน: ฿{req.totalBudget.toLocaleString()}
                  </span>
                  <Link
                    href={`/requests/${req.id}`}
                    className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs flex items-center gap-1 transition-colors focus-ring"
                  >
                    แก้ไขคำขอ <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}

            {pendingRequests.slice(0, returnedRequests.length > 0 ? 1 : 2).map((req) => (
              <div
                key={req.id}
                className="p-4 sm:p-5 rounded-2xl border border-amber-200 bg-amber-50/40 shadow-sm flex flex-col justify-between gap-3 transition-all hover:border-amber-300"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-brand-primary">
                      {req.code}
                    </span>
                    <StatusBadge status="pending_approval" size="sm" />
                  </div>
                  <h4 className="font-bold text-sm text-brand-text line-clamp-2">
                    {req.title}
                  </h4>
                  <p className="text-xs text-slate-600">
                    ยื่นคำขอโดย: <span className="font-semibold">{req.requesterName}</span> ({req.department})
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-amber-200/60 text-xs">
                  <span className="text-slate-600 font-mono">
                    งบประมาณ: ฿{req.totalBudget.toLocaleString()}
                  </span>
                  <Link
                    href={`/requests/${req.id}`}
                    className="px-3 py-1.5 rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold text-xs flex items-center gap-1 transition-colors focus-ring"
                  >
                    ตรวจสอบคำขอ <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Metric Summary Overview Cards */}
      <section aria-labelledby="metrics-title" className="space-y-3">
        <h2 id="metrics-title" className="text-base sm:text-lg font-bold text-brand-text">
          สรุปภาพรวมคำขอและงบประมาณ
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Total Requests */}
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-m3 hover:shadow-m3-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-brand-muted">คำขอทั้งหมด</span>
              <div className="w-8 h-8 rounded-xl bg-orange-50 text-brand-primary flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-brand-text font-mono">
              {metrics.totalRequests}
            </p>
            <span className="text-[11px] text-slate-500 mt-1 block">รายการในระบบ</span>
          </div>

          {/* Card 2: Pending Approval */}
          <div className="p-4 sm:p-5 rounded-2xl border border-amber-200/70 bg-amber-50/40 shadow-m3 hover:shadow-m3-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-amber-900">รออนุมัติ</span>
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-950 font-mono">
              {metrics.pendingApprovalCount}
            </p>
            <span className="text-[11px] text-amber-700 mt-1 block">อยู่ระหว่างการพิจารณา</span>
          </div>

          {/* Card 3: Approved */}
          <div className="p-4 sm:p-5 rounded-2xl border border-emerald-200/70 bg-emerald-50/40 shadow-m3 hover:shadow-m3-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-emerald-900">อนุมัติแล้ว</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-950 font-mono">
              {metrics.approvedCount}
            </p>
            <span className="text-[11px] text-emerald-700 mt-1 block">พร้อมดำเนินการเบิกจ่าย</span>
          </div>

          {/* Card 4: Total Approved Budget */}
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-m3 hover:shadow-m3-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-brand-muted">งบประมาณที่อนุมัติ</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-brand-secondary flex items-center justify-center">
                <Banknote className="w-4 h-4" />
              </div>
            </div>
            <MoneyValue amount={metrics.totalBudgetApproved} size="lg" highlight className="font-extrabold text-brand-primary" />
            <span className="text-[11px] text-slate-500 mt-1 block">จากยอดเสนอ ฿{metrics.totalBudgetRequested.toLocaleString()}</span>
          </div>
        </div>
      </section>

      {/* Recent Requests Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-brand-text">
              คำขอล่าสุด (Recent Requests)
            </h2>
            <p className="text-xs text-brand-muted">รายการคำขอที่เพิ่งมีการปรับปรุงสถานะ</p>
          </div>

          <Link
            href="/requests"
            className="text-xs sm:text-sm font-semibold text-brand-primary hover:underline flex items-center gap-1 focus-ring rounded"
          >
            ดูคำขอทั้งหมด ({requests.length}) <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Desktop Table View */}
        <RequestTable requests={recentRequests} />

        {/* Mobile Cards View */}
        <div className="md:hidden space-y-3">
          {recentRequests.map((req) => (
            <RequestCard key={req.id} request={req} />
          ))}
        </div>
      </section>
    </div>
  );
}
