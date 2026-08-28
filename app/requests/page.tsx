"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { usePema } from "@/lib/context/RequestContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { RequestFilterBar } from "@/components/domain/RequestFilterBar";
import { RequestTable } from "@/components/domain/RequestTable";
import { RequestCard } from "@/components/domain/RequestCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Plus, FileSpreadsheet } from "lucide-react";

export default function RequestListPage() {
  const { requests } = usePema();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Calculate status counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: requests.length,
      pending_approval: 0,
      approved: 0,
      returned: 0,
      draft: 0,
      disbursed: 0,
    };

    requests.forEach((r) => {
      if (counts[r.status] !== undefined) {
        counts[r.status] += 1;
      }
    });

    return counts;
  }, [requests]);

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesCode = r.code.toLowerCase().includes(q);
        const matchesTitle = r.title.toLowerCase().includes(q);
        const matchesDept = r.department.toLowerCase().includes(q);
        const matchesRequester = r.requesterName.toLowerCase().includes(q);
        if (!matchesCode && !matchesTitle && !matchesDept && !matchesRequester) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== "all" && r.status !== statusFilter) {
        return false;
      }

      // Category filter
      if (categoryFilter !== "all" && r.category !== categoryFilter) {
        return false;
      }

      return true;
    });
  }, [requests, search, statusFilter, categoryFilter]);

  const handleReset = () => {
    setSearch("");
    setStatusFilter("all");
    setCategoryFilter("all");
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="รายการคำขอโครงการ"
        subtitle="ค้นหา ติดตามสถานะ และจัดการคำขอโครงการและงบประมาณทั้งหมดในระบบ"
        breadcrumbs={[
          { label: "หน้าแรก", href: "/" },
          { label: "รายการคำขอโครงการ" },
        ]}
        actions={
          <Link
            href="/requests/create"
            className="px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs sm:text-sm font-semibold shadow-sm transition-all flex items-center gap-1.5 focus-ring touch-target"
          >
            <Plus className="w-4 h-4" /> สร้างคำขอใหม่
          </Link>
        }
      />

      {/* Filter and search bar */}
      <RequestFilterBar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        statusCounts={statusCounts}
        onReset={handleReset}
      />

      {/* Content list or Empty State */}
      {filteredRequests.length === 0 ? (
        <EmptyState
          title="ไม่พบรายการคำขอที่ค้นหา"
          description="ลองปรับเปลี่ยนคำค้นหา หรือรีเซ็ตตัวกรองสถานะและประเภทโครงการ"
          icon={FileSpreadsheet}
          action={
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-colors focus-ring"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-brand-muted px-1">
            <span>แสดงผลลัพธ์ {filteredRequests.length} รายการ</span>
            <span>จัดเรียงตามวันที่สร้างล่าสุด</span>
          </div>

          {/* Desktop Table View */}
          <RequestTable requests={filteredRequests} />

          {/* Mobile Card List */}
          <div className="md:hidden space-y-3">
            {filteredRequests.map((req) => (
              <RequestCard key={req.id} request={req} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
