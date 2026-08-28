"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { usePema } from "@/lib/context/RequestContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { TextField } from "@/components/fields/TextField";
import { SelectField } from "@/components/fields/SelectField";
import { TextareaField } from "@/components/fields/TextareaField";
import { MoneyValue } from "@/components/ui/MoneyValue";
import { DisbursementItem } from "@/lib/types/pema";
import { Banknote, Send } from "lucide-react";

function CreateDisbursementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestIdParam = searchParams.get("requestId");

  const { requests, getRequestById, createDisbursement } = usePema();

  const approvedRequests = requests.filter(
    (r) => r.status === "approved" || r.id === requestIdParam
  );

  const [selectedRequestId, setSelectedRequestId] = useState(requestIdParam || "");
  const selectedRequest = getRequestById(selectedRequestId);

  const [payeeName, setPayeeName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [note, setNote] = useState("");
  const [items, setItems] = useState<DisbursementItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize items when selected request changes
  useEffect(() => {
    if (!selectedRequest) return;
    const timer = window.setTimeout(() => {
      setPayeeName(selectedRequest.requesterName || "");
      const disbItems: DisbursementItem[] = selectedRequest.expenses.map((exp, idx) => ({
        id: `d-item-${Date.now()}-${idx}`,
        expenseItemId: exp.id,
        category: exp.category,
        description: exp.description,
        budgetAllocated: exp.total,
        actualAmount: exp.total,
        invoiceNo: "",
        receiptDate: new Date().toISOString().split("T")[0],
        vendorName: "ร้านค้า / ผู้รับเงิน",
      }));
      setItems(disbItems);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [selectedRequest]);

  const updateItem = (index: number, field: keyof DisbursementItem, val: string | number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: val };
    setItems(updated);
  };

  const totalApproved = selectedRequest ? selectedRequest.totalBudget : 0;
  const totalActual = items.reduce((sum, item) => sum + (Number(item.actualAmount) || 0), 0);
  const remaining = totalApproved - totalActual;

  const handleSubmit = async () => {
    if (!selectedRequest) return;
    setIsSubmitting(true);

    try {
      const result = await createDisbursement({
        requestId: selectedRequest.id,
        requestCode: selectedRequest.code,
        projectTitle: selectedRequest.title,
        department: selectedRequest.department,
        requesterName: selectedRequest.requesterName,
        status: "under_review",
        totalApprovedBudget: totalApproved,
        totalActualAmount: totalActual,
        remainingBalance: remaining,
        payeeName: payeeName || selectedRequest.requesterName,
        bankAccount: bankAccount || "ธนาคารกรุงไทย 123-4-56789-0",
        note,
        items,
      });

      router.push(`/disbursements/${result.id}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      <PageHeader
        title="บันทึกการเบิกจ่ายงบประมาณ"
        subtitle="บันทึกรายการใช้จ่ายจริงตามใบเสร็จรับเงิน เทียบกับกรอบงบประมาณที่ได้รับอนุมัติ"
        backHref="/disbursements"
        breadcrumbs={[
          { label: "หน้าแรก", href: "/" },
          { label: "ระบบเบิกจ่าย", href: "/disbursements" },
          { label: "บันทึกการเบิกจ่ายใหม่" },
        ]}
      />

      {/* Select Approved Request */}
      <SectionCard title="1. เลือกโครงการที่ได้รับอนุมัติแล้ว" icon={Banknote}>
        <div className="space-y-4">
          <SelectField
            id="requestSelect"
            label="เลือกโครงการ"
            required
            placeholder="-- กรุณาเลือกโครงการที่อนุมัติแล้ว --"
            value={selectedRequestId}
            onChange={(e) => setSelectedRequestId(e.target.value)}
            options={approvedRequests.map((r) => ({
              value: r.id,
              label: `${r.code}: ${r.title} (งบ ฿${r.totalBudget.toLocaleString()})`,
            }))}
          />

          {selectedRequest && (
            <div className="p-4 rounded-xl bg-brand-primary/5 border border-brand-primary/20 text-xs sm:text-sm space-y-1">
              <p className="font-bold text-brand-text">{selectedRequest.title}</p>
              <p className="text-brand-muted">
                หน่วยงาน: {selectedRequest.department} • ผู้รับผิดชอบ: {selectedRequest.requesterName}
              </p>
              <div className="pt-2 flex items-center gap-2">
                <span className="font-semibold text-brand-text">งบประมาณที่ได้รับอนุมัติ:</span>
                <MoneyValue amount={selectedRequest.totalBudget} size="sm" highlight />
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Disbursement Receipt Items Table */}
      {selectedRequest && (
        <>
          <SectionCard
            title="2. รายละเอียดใบเสร็จรับเงิน / ยอดเบิกจ่ายจริง"
            subtitle="กรอกเลขที่ใบเสร็จและยอดเงินที่จ่ายจริงตามใบเสร็จแต่ละรายการ"
            icon={Banknote}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-brand-muted uppercase">
                  <tr>
                    <th className="py-3 px-3">รายการค่าใช้จ่าย</th>
                    <th className="py-3 px-3 text-right w-28">งบอนุมัติ (฿)</th>
                    <th className="py-3 px-3 text-right w-36">จ่ายจริง (฿)</th>
                    <th className="py-3 px-3 w-36">เลขที่ใบเสร็จ / ใบแจ้งหนี้</th>
                    <th className="py-3 px-3 w-40">ร้านค้า / ผู้รับเงิน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3">
                        <p className="font-semibold text-xs sm:text-sm text-brand-text">
                          {item.description}
                        </p>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <MoneyValue amount={item.budgetAllocated} size="sm" />
                      </td>

                      <td className="py-3 px-3 text-right">
                        <input
                          type="number"
                          value={item.actualAmount || ""}
                          onChange={(e) => updateItem(idx, "actualAmount", Number(e.target.value) || 0)}
                          className="w-full text-sm font-mono text-right py-1.5 px-2 rounded-lg border border-slate-200 focus-ring font-semibold text-brand-primary"
                        />
                      </td>

                      <td className="py-3 px-3">
                        <input
                          type="text"
                          value={item.invoiceNo}
                          placeholder="เช่น INV-2026-01"
                          onChange={(e) => updateItem(idx, "invoiceNo", e.target.value)}
                          className="w-full text-xs py-1.5 px-2 rounded-lg border border-slate-200 focus-ring"
                        />
                      </td>

                      <td className="py-3 px-3">
                        <input
                          type="text"
                          value={item.vendorName}
                          placeholder="ชื่อบริษัท/ร้านค้า"
                          onChange={(e) => updateItem(idx, "vendorName", e.target.value)}
                          className="w-full text-xs py-1.5 px-2 rounded-lg border border-slate-200 focus-ring"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Summary Box */}
            <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
              <div className="space-y-1">
                <p className="text-brand-muted">
                  งบอนุมัติรวม: <span className="font-mono font-bold text-slate-800">฿{totalApproved.toLocaleString()}</span>
                </p>
                <p className="text-brand-muted">
                  ยอดเบิกจ่ายจริงรวม: <span className="font-mono font-bold text-brand-primary">฿{totalActual.toLocaleString()}</span>
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-emerald-800 font-semibold block">
                  งบประมาณคงเหลือคืนกองทุน:
                </span>
                <MoneyValue amount={remaining} size="lg" highlight className="text-emerald-700 font-bold font-mono" />
              </div>
            </div>
          </SectionCard>

          {/* Payee Info */}
          <SectionCard title="3. ข้อมูลผู้รับเงินและการโอนเงิน" icon={Banknote}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                id="payeeName"
                label="ชื่อผู้รับเงิน / ผู้ยืมเงินทดรอง"
                required
                value={payeeName}
                onChange={(e) => setPayeeName(e.target.value)}
              />

              <TextField
                id="bankAccount"
                label="เลขที่บัญชีธนาคารสำหรับโอนเงิน"
                placeholder="เช่น ธนาคารกรุงไทย 123-4-56789-0"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
              />

              <TextareaField
                id="note"
                label="หมายเหตุประกอบการเบิกจ่าย"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="sm:col-span-2"
              />
            </div>
          </SectionCard>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Link
              href="/disbursements"
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition-colors focus-ring"
            >
              ยกเลิก
            </Link>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs sm:text-sm font-bold shadow-md transition-all focus-ring flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? "กำลังบันทึก..." : "ส่งเอกสารขอเบิกจ่าย"}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function CreateDisbursementPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-sm font-semibold text-brand-muted">
          กำลังเตรียมแบบฟอร์มการเบิกจ่าย...
        </div>
      }
    >
      <CreateDisbursementContent />
    </Suspense>
  );
}
