"use client";

import React from "react";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { ExpenseItem } from "@/lib/types/pema";
import { MoneyValue } from "@/components/ui/MoneyValue";

interface ExpenseItemArrayProps {
  items: ExpenseItem[];
  onChange: (items: ExpenseItem[]) => void;
  readOnly?: boolean;
}

const CATEGORY_OPTIONS = [
  { value: "honorarium", label: "ค่าตอบแทน / วิทยากร", capLimit: 1500, capUnit: "บ./ชม." },
  { value: "food", label: "ค่าอาหารและเครื่องดื่ม", capLimit: 50, capUnit: "บ./มื้อ (เบรก)" },
  { value: "travel", label: "ค่าเดินทางและยานพาหนะ", capLimit: 0, capUnit: "" },
  { value: "material", label: "ค่าวัสดุและอุปกรณ์", capLimit: 0, capUnit: "" },
  { value: "venue", label: "ค่าสถานที่และบริการ", capLimit: 0, capUnit: "" },
  { value: "other", label: "ค่าใช้จ่ายอื่นๆ", capLimit: 0, capUnit: "" },
];

export const ExpenseItemArray: React.FC<ExpenseItemArrayProps> = ({
  items,
  onChange,
  readOnly = false,
}) => {
  const addItem = () => {
    const newItem: ExpenseItem = {
      id: `exp-${Date.now()}`,
      category: "food",
      description: "",
      unitPrice: 50,
      quantity: 1,
      unit: "มื้อ",
      total: 50,
    };
    onChange([...items, newItem]);
  };

  const updateItem = (index: number, field: keyof ExpenseItem, value: string | number) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };

    // Auto-recalculate total
    if (field === "unitPrice" || field === "quantity") {
      const price = field === "unitPrice" ? Number(value) || 0 : Number(item.unitPrice) || 0;
      const qty = field === "quantity" ? Number(value) || 0 : Number(item.quantity) || 0;
      item.total = price * qty;
    }

    // Check cap rules
    if (item.category === "food" && item.unitPrice > 50 && item.unit.includes("ว่าง")) {
      item.capWarning = "เพดานค่าอาหารว่างสูงสุด 50 บ./คน/มื้อ";
    } else if (item.category === "honorarium" && item.unitPrice > 1500) {
      item.capWarning = "เพดานค่าตอบแทนวิทยากรปกติ 1,500 บ./ชม. (หากสูงกว่าต้องมีเหตุผลแนบ)";
    } else {
      item.capWarning = undefined;
    }

    updated[index] = item;
    onChange(updated);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-brand-muted uppercase">
            <tr>
              <th className="py-3 px-4 w-12 text-center">#</th>
              <th className="py-3 px-4 w-44">หมวดค่าใช้จ่าย</th>
              <th className="py-3 px-4">รายละเอียด / วัตถุประสงค์</th>
              <th className="py-3 px-3 w-28 text-right">ราคา/หน่วย (฿)</th>
              <th className="py-3 px-3 w-20 text-center">จำนวน</th>
              <th className="py-3 px-3 w-24">หน่วยนับ</th>
              <th className="py-3 px-4 w-32 text-right">รวมเงิน (฿)</th>
              {!readOnly && <th className="py-3 px-3 w-12 text-center"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item, index) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-4 text-center text-xs text-slate-400 font-mono">
                  {index + 1}
                </td>

                <td className="py-3 px-4">
                  {readOnly ? (
                    <span className="text-xs font-medium text-slate-700">
                      {CATEGORY_OPTIONS.find((c) => c.value === item.category)?.label || item.category}
                    </span>
                  ) : (
                    <select
                      value={item.category}
                      onChange={(e) => updateItem(index, "category", e.target.value)}
                      className="w-full text-xs py-1.5 px-2 rounded-lg border border-slate-200 bg-white text-brand-text focus-ring"
                    >
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  )}
                </td>

                <td className="py-3 px-4">
                  {readOnly ? (
                    <div>
                      <p className="text-brand-text font-medium">{item.description || "-"}</p>
                      {item.capWarning && (
                        <p className="text-xs text-amber-600 mt-0.5 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {item.capWarning}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <input
                        type="text"
                        value={item.description}
                        placeholder="ระบุรายละเอียดค่าใช้จ่าย เช่น ค่าอาหารว่าง 45 คน x 2 มื้อ"
                        onChange={(e) => updateItem(index, "description", e.target.value)}
                        className="w-full text-sm py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-brand-text placeholder:text-slate-400 focus-ring"
                      />
                      {item.capWarning && (
                        <p className="text-xs text-amber-600 mt-1 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3.5 h-3.5" /> {item.capWarning}
                        </p>
                      )}
                    </div>
                  )}
                </td>

                <td className="py-3 px-3 text-right">
                  {readOnly ? (
                    <MoneyValue amount={item.unitPrice} size="sm" currencySymbol={false} />
                  ) : (
                    <input
                      type="number"
                      value={item.unitPrice || ""}
                      min="0"
                      step="any"
                      onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                      className="w-full text-sm font-mono text-right py-1.5 px-2 rounded-lg border border-slate-200 bg-white focus-ring"
                    />
                  )}
                </td>

                <td className="py-3 px-3 text-center">
                  {readOnly ? (
                    <span className="font-mono text-sm">{item.quantity}</span>
                  ) : (
                    <input
                      type="number"
                      value={item.quantity || ""}
                      min="1"
                      onChange={(e) => updateItem(index, "quantity", e.target.value)}
                      className="w-full text-sm font-mono text-center py-1.5 px-2 rounded-lg border border-slate-200 bg-white focus-ring"
                    />
                  )}
                </td>

                <td className="py-3 px-3">
                  {readOnly ? (
                    <span className="text-xs text-slate-600">{item.unit}</span>
                  ) : (
                    <input
                      type="text"
                      value={item.unit}
                      placeholder="มื้อ / คน / วัน"
                      onChange={(e) => updateItem(index, "unit", e.target.value)}
                      className="w-full text-xs py-1.5 px-2 rounded-lg border border-slate-200 bg-white focus-ring"
                    />
                  )}
                </td>

                <td className="py-3 px-4 text-right font-mono font-semibold text-brand-text">
                  <MoneyValue amount={item.total} size="sm" />
                </td>

                {!readOnly && (
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors focus-ring"
                      aria-label={`ลบรายการที่ ${index + 1}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card / Disclosure View (Section 7 in README) */}
      <div className="lg:hidden space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-2.5 py-1 rounded-full">
                รายการที่ {index + 1}
              </span>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors focus-ring touch-target flex items-center justify-center"
                  aria-label={`ลบรายการที่ ${index + 1}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {readOnly ? (
              <div className="space-y-1.5 text-sm">
                <p className="font-semibold text-brand-text">{item.description}</p>
                <p className="text-xs text-brand-muted">
                  หมวด: {CATEGORY_OPTIONS.find((c) => c.value === item.category)?.label || item.category}
                </p>
                <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs">
                  <span>
                    {item.quantity} {item.unit} x ฿{item.unitPrice}
                  </span>
                  <MoneyValue amount={item.total} size="md" highlight />
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">
                    หมวดค่าใช้จ่าย
                  </label>
                  <select
                    value={item.category}
                    onChange={(e) => updateItem(index, "category", e.target.value)}
                    className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-brand-text focus-ring"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">
                    รายละเอียด
                  </label>
                  <input
                    type="text"
                    value={item.description}
                    placeholder="รายละเอียดค่าใช้จ่าย"
                    onChange={(e) => updateItem(index, "description", e.target.value)}
                    className="w-full text-sm py-2 px-3 rounded-xl border border-slate-200 bg-white text-brand-text placeholder:text-slate-400 focus-ring"
                  />
                  {item.capWarning && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {item.capWarning}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">
                      ราคา/หน่วย
                    </label>
                    <input
                      type="number"
                      value={item.unitPrice || ""}
                      onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                      className="w-full text-sm font-mono py-2 px-2.5 rounded-xl border border-slate-200 bg-white text-right focus-ring"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">จำนวน</label>
                    <input
                      type="number"
                      value={item.quantity || ""}
                      onChange={(e) => updateItem(index, "quantity", e.target.value)}
                      className="w-full text-sm font-mono py-2 px-2.5 rounded-xl border border-slate-200 bg-white text-center focus-ring"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">หน่วย</label>
                    <input
                      type="text"
                      value={item.unit}
                      placeholder="คน/มื้อ"
                      onChange={(e) => updateItem(index, "unit", e.target.value)}
                      className="w-full text-xs py-2 px-2.5 rounded-xl border border-slate-200 bg-white focus-ring"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">รวมเป็นเงิน:</span>
                  <MoneyValue amount={item.total} size="md" highlight />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {!readOnly && (
        <button
          type="button"
          onClick={addItem}
          className="w-full py-3 border-2 border-dashed border-slate-300 hover:border-brand-primary rounded-2xl text-sm font-semibold text-brand-primary hover:bg-brand-primary/5 flex items-center justify-center gap-2 transition-all focus-ring touch-target"
        >
          <Plus className="w-4 h-4" /> เพิ่มรายการค่าใช้จ่าย
        </button>
      )}
    </div>
  );
};
