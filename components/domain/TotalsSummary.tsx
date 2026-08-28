import React from "react";
import { ExpenseItem } from "@/lib/types/pema";
import { MoneyValue } from "@/components/ui/MoneyValue";
import { AlertTriangle, CheckCircle, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

interface TotalsSummaryProps {
  expenses: ExpenseItem[];
  className?: string;
  isDetailed?: boolean;
}

export const TotalsSummary: React.FC<TotalsSummaryProps> = ({
  expenses,
  className,
  isDetailed = true,
}) => {
  const totalAmount = expenses.reduce((sum, item) => sum + (Number(item.total) || 0), 0);

  // Group by category
  const categories: Record<string, { label: string; amount: number }> = {
    honorarium: { label: "ค่าตอบแทน / วิทยากร", amount: 0 },
    food: { label: "ค่าอาหารและเครื่องดื่ม", amount: 0 },
    travel: { label: "ค่าเดินทางและยานพาหนะ", amount: 0 },
    material: { label: "ค่าวัสดุและอุปกรณ์", amount: 0 },
    venue: { label: "ค่าสถานที่และบริการ", amount: 0 },
    other: { label: "ค่าใช้จ่ายอื่นๆ", amount: 0 },
  };

  expenses.forEach((item) => {
    if (categories[item.category]) {
      categories[item.category].amount += Number(item.total) || 0;
    } else {
      categories.other.amount += Number(item.total) || 0;
    }
  });

  const hasCapWarning = expenses.some((item) => item.capWarning);

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-5 shadow-m3 transition-all",
        className
      )}
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-brand-text">สรุปงบประมาณรวม</h4>
            <p className="text-xs text-brand-muted">{expenses.length} รายการค่าใช้จ่าย</p>
          </div>
        </div>

        <MoneyValue amount={totalAmount} size="xl" highlight className="font-bold text-brand-primary" />
      </div>

      {/* Category Breakdown */}
      {isDetailed && (
        <div className="space-y-2 mb-4">
          {Object.entries(categories)
            .filter(([_, cat]) => cat.amount > 0)
            .map(([key, cat]) => {
              const percent = totalAmount > 0 ? (cat.amount / totalAmount) * 100 : 0;
              return (
                <div key={key} className="text-xs">
                  <div className="flex items-center justify-between py-1 text-slate-600">
                    <span>{cat.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-mono">({percent.toFixed(0)}%)</span>
                      <MoneyValue amount={cat.amount} size="sm" />
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-brand-secondary h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Cap Warnings or Validation Notice */}
      {hasCapWarning ? (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">มีรายการที่ต้องตรวจสอบเพดานงบประมาณ</p>
            <p className="text-amber-700 mt-0.5">โปรดตรวจสอบอัตราค่าใช้จ่ายให้สอดคล้องตามระเบียบเงินงบประมาณ</p>
          </div>
        </div>
      ) : (
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>อัตราค่าใช้จ่ายอยู่ในเกณฑ์และระเบียบมาตรฐาน</span>
        </div>
      )}
    </div>
  );
};
