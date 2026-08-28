import React from "react";
import { RequestStatus } from "@/lib/types/pema";
import { cn } from "@/lib/utils";
import {
  FileEdit,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Banknote,
} from "lucide-react";

interface StatusBadgeProps {
  status: RequestStatus | string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const statusConfig: Record<
  string,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  draft: {
    label: "ฉบับร่าง",
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
    icon: FileEdit,
  },
  pending_approval: {
    label: "รออนุมัติ",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    icon: Clock,
  },
  approved: {
    label: "อนุมัติแล้ว",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
    icon: CheckCircle2,
  },
  returned: {
    label: "ส่งกลับแก้ไข",
    bg: "bg-orange-50",
    text: "text-orange-800",
    border: "border-orange-200",
    icon: AlertCircle,
  },
  rejected: {
    label: "ไม่อนุมัติ",
    bg: "bg-rose-50",
    text: "text-rose-800",
    border: "border-rose-200",
    icon: XCircle,
  },
  disbursed: {
    label: "เบิกจ่ายแล้ว",
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
    icon: Banknote,
  },
  paid: {
    label: "จ่ายเงินแล้ว",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
    icon: CheckCircle2,
  },
  under_review: {
    label: "รอตรวจสอบ",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    icon: Clock,
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "md",
  className,
}) => {
  const config = statusConfig[status] || {
    label: status,
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
    icon: FileEdit,
  };

  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-xs sm:text-sm font-medium gap-1.5",
    lg: "px-3.5 py-1.5 text-sm font-semibold gap-2",
  }[size];

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  }[size];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border shadow-sm transition-colors",
        config.bg,
        config.text,
        config.border,
        sizeClasses,
        className
      )}
      role="status"
    >
      <Icon className={cn(iconSizes, "flex-shrink-0")} />
      <span>{config.label}</span>
    </span>
  );
};
