import React from "react";
import Link from "next/link";
import { PemaRequest } from "@/lib/types/pema";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MoneyValue } from "@/components/ui/MoneyValue";
import { formatDateThai } from "@/lib/utils";
import { ChevronRight, Calendar, Building, User } from "lucide-react";

interface RequestTableProps {
  requests: PemaRequest[];
}

export const RequestTable: React.FC<RequestTableProps> = ({ requests }) => {
  return (
    <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-m3">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-brand-muted uppercase tracking-wider">
            <tr>
              <th scope="col" className="py-3.5 px-4 w-36">
                รหัสคำขอ
              </th>
              <th scope="col" className="py-3.5 px-4 min-w-[280px]">
                ชื่อโครงการ / หน่วยงาน
              </th>
              <th scope="col" className="py-3.5 px-4 w-44">
                ผู้ยื่นคำขอ
              </th>
              <th scope="col" className="py-3.5 px-4 w-36 text-center">
                สถานะ
              </th>
              <th scope="col" className="py-3.5 px-4 w-36 text-right">
                งบประมาณ (฿)
              </th>
              <th scope="col" className="py-3.5 px-4 w-20 text-center">
                <span className="sr-only">ดูรายละเอียด</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requests.map((req) => (
              <tr
                key={req.id}
                className="hover:bg-brand-primary/5 transition-colors group cursor-pointer"
              >
                <td className="py-4 px-4 font-mono font-bold text-xs text-brand-primary">
                  <Link
                    href={`/requests/${req.id}`}
                    className="hover:underline focus-ring rounded"
                  >
                    {req.code}
                  </Link>
                  <p className="text-[11px] text-brand-muted font-sans font-normal mt-0.5">
                    {formatDateThai(req.createdAt)}
                  </p>
                </td>

                <td className="py-4 px-4">
                  <Link
                    href={`/requests/${req.id}`}
                    className="font-semibold text-brand-text group-hover:text-brand-primary transition-colors block text-sm leading-snug line-clamp-2"
                  >
                    {req.title}
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-brand-muted mt-1.5 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      {req.department}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDateThai(req.startDate)}
                    </span>
                  </div>
                </td>

                <td className="py-4 px-4 text-xs text-slate-700">
                  <div className="flex items-center gap-1.5 font-medium">
                    <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{req.requesterName}</span>
                  </div>
                  <p className="text-[11px] text-brand-muted mt-0.5 truncate pl-5">
                    {req.requesterRole}
                  </p>
                </td>

                <td className="py-4 px-4 text-center">
                  <StatusBadge status={req.status} size="sm" />
                </td>

                <td className="py-4 px-4 text-right">
                  <MoneyValue amount={req.totalBudget} size="sm" highlight />
                </td>

                <td className="py-4 px-4 text-center">
                  <Link
                    href={`/requests/${req.id}`}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-brand-primary group-hover:text-white text-slate-600 transition-all focus-ring"
                    aria-label={`ดูรายละเอียดโครงการ ${req.code}`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
