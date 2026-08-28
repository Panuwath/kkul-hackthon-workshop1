"use client";

import React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface RequestFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (cat: string) => void;
  statusCounts: Record<string, number>;
  onReset: () => void;
}

const STATUS_CHIPS = [
  { value: "all", label: "ทั้งหมด" },
  { value: "pending_approval", label: "รออนุมัติ" },
  { value: "returned", label: "ส่งกลับแก้ไข" },
  { value: "approved", label: "อนุมัติแล้ว" },
  { value: "draft", label: "ฉบับร่าง" },
  { value: "disbursed", label: "เบิกจ่ายแล้ว" },
];

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "ทุกประเภทโครงการ" },
  { value: "training", label: "อบรม / สัมมนา" },
  { value: "research", label: "วิจัยและนวัตกรรม" },
  { value: "student_activity", label: "กิจกรรมนักศึกษา" },
  { value: "procurement", label: "จัดซื้อจัดจ้าง" },
  { value: "service", label: "บริการวิชาการ" },
];

export const RequestFilterBar: React.FC<RequestFilterBarProps> = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  statusCounts,
  onReset,
}) => {
  const isFiltered = search !== "" || statusFilter !== "all" || categoryFilter !== "all";

  return (
    <div className="space-y-3.5 mb-6">
      {/* Top Search & Category Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ค้นหาชื่อโครงการ, รหัสคำขอ, หน่วยงาน, หรือผู้ยื่น..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-brand-text placeholder:text-slate-400 focus-ring shadow-sm"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md"
              aria-label="ล้างคำค้นหา"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Select */}
        <div className="w-full sm:w-56">
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
            className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-sm text-brand-text focus-ring shadow-sm"
            aria-label="กรองตามประเภทโครงการ"
          >
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Filters Button */}
        {isFiltered && (
          <button
            type="button"
            onClick={onReset}
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors focus-ring flex items-center justify-center gap-1.5 shadow-sm touch-target"
          >
            <X className="w-3.5 h-3.5" /> ล้างตัวกรอง
          </button>
        )}
      </div>

      {/* Horizontal Scrollable Status Chips (Section 7 in README) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {STATUS_CHIPS.map((chip) => {
          const isActive = statusFilter === chip.value;
          const count = chip.value === "all" ? statusCounts.all : statusCounts[chip.value] || 0;

          return (
            <button
              key={chip.value}
              type="button"
              onClick={() => onStatusFilterChange(chip.value)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 focus-ring touch-target",
                isActive
                  ? "bg-brand-primary text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-brand-text"
              )}
            >
              <span>{chip.label}</span>
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded-full text-[10px] font-mono",
                  isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
