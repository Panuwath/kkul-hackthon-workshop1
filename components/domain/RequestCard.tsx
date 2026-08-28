import React from "react";
import Link from "next/link";
import { PemaRequest } from "@/lib/types/pema";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MoneyValue } from "@/components/ui/MoneyValue";
import { formatDateThai } from "@/lib/utils";
import { Calendar, Building, ChevronRight, AlertTriangle } from "lucide-react";

interface RequestCardProps {
  request: PemaRequest;
}

export const RequestCard: React.FC<RequestCardProps> = ({ request }) => {
  return (
    <Link
      href={`/requests/${request.id}`}
      className="block p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-m3 hover:border-brand-secondary/50 hover:shadow-m3-md transition-all active:scale-[0.99] touch-target group"
    >
      {/* Top Header: Code & Status */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span className="font-mono font-bold text-xs text-brand-primary">
          {request.code}
        </span>
        <StatusBadge status={request.status} size="sm" />
      </div>

      {/* Title */}
      <h3 className="font-bold text-sm sm:text-base text-brand-text group-hover:text-brand-primary transition-colors leading-snug line-clamp-2 mb-2">
        {request.title}
      </h3>

      {/* Return Warning Banner if status is returned */}
      {request.status === "returned" && request.returnReason && (
        <div className="mb-3 p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-950 text-xs flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-orange-600 flex-shrink-0 mt-0.5" />
          <p className="line-clamp-2">
            <span className="font-semibold">ข้อสังเกต:</span> {request.returnReason}
          </p>
        </div>
      )}

      {/* Metadata */}
      <div className="space-y-1 text-xs text-brand-muted mb-3">
        <div className="flex items-center gap-1.5 truncate">
          <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="truncate">{request.department}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span>
            {formatDateThai(request.startDate)} - {formatDateThai(request.endDate)}
          </span>
        </div>
      </div>

      {/* Footer: Requester & Budget */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
        <span className="text-slate-600 truncate max-w-[140px] font-medium">
          {request.requesterName}
        </span>
        <div className="flex items-center gap-1.5">
          <MoneyValue amount={request.totalBudget} size="sm" highlight />
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </Link>
  );
};
