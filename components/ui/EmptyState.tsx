import React from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "ไม่พบข้อมูล",
  description = "ยังไม่มีรายการข้อมูลในระบบ หรือลองปรับเปลี่ยนเงื่อนไขการค้นหา",
  icon: Icon = FolderOpen,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50",
        className
      )}
      role="region"
      aria-label={title}
    >
      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-brand-secondary flex items-center justify-center mb-4 shadow-sm">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-brand-text mb-1.5">{title}</h3>
      <p className="text-xs sm:text-sm text-brand-muted max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {action && <div className="flex items-center justify-center">{action}</div>}
    </div>
  );
};
