import React from "react";
import { ApprovalTimelineItem } from "@/lib/types/pema";
import { CheckCircle2, Clock, AlertCircle, XCircle, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";

interface ApprovalTimelineProps {
  timeline: ApprovalTimelineItem[];
  className?: string;
}

export const ApprovalTimeline: React.FC<ApprovalTimelineProps> = ({
  timeline,
  className,
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2.5 before:bottom-2.5 before:w-0.5 before:bg-slate-200">
        {timeline.map((step, index) => {
          const isCompleted = step.status === "completed";
          const isCurrent = step.status === "current";
          const isReturned = step.status === "returned";
          const isRejected = step.status === "rejected";

          return (
            <div key={step.id || index} className="relative group">
              {/* Step Icon / Dot */}
              <div
                className={cn(
                  "absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white transition-all",
                  isCompleted && "bg-emerald-500 text-white",
                  isCurrent && "bg-brand-secondary text-white animate-pulse",
                  isReturned && "bg-orange-500 text-white",
                  isRejected && "bg-rose-500 text-white",
                  step.status === "pending" && "bg-slate-200 text-slate-400"
                )}
              >
                {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                {isCurrent && <CircleDot className="w-3.5 h-3.5" />}
                {isReturned && <AlertCircle className="w-3.5 h-3.5" />}
                {isRejected && <XCircle className="w-3.5 h-3.5" />}
                {step.status === "pending" && <Clock className="w-3 h-3" />}
              </div>

              {/* Step Content */}
              <div
                className={cn(
                  "p-3.5 rounded-xl border transition-all",
                  isReturned
                    ? "bg-orange-50/60 border-orange-200 text-orange-950"
                    : isCurrent
                    ? "bg-brand-primary/5 border-brand-primary/30 shadow-sm"
                    : isCompleted
                    ? "bg-slate-50/50 border-slate-200"
                    : "bg-transparent border-slate-100 opacity-60"
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                  <h5 className="text-xs sm:text-sm font-bold text-brand-text">
                    {step.stepName}
                  </h5>
                  {step.timestamp && (
                    <span className="text-[11px] text-brand-muted font-mono">
                      {step.timestamp}
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-600 mb-1">
                  <span className="font-semibold text-brand-text">{step.actorName}</span>
                  {step.actorRole && (
                    <span className="text-brand-muted"> ({step.actorRole})</span>
                  )}
                </div>

                {step.comment && (
                  <div
                    className={cn(
                      "mt-2 p-2.5 rounded-lg text-xs leading-relaxed",
                      isReturned
                        ? "bg-white border border-orange-300 text-orange-900 font-medium"
                        : "bg-white/80 border border-slate-200 text-slate-700"
                    )}
                  >
                    <p className="font-semibold text-[11px] text-slate-500 mb-0.5">
                      {isReturned ? "⚠️ ข้อสังเกต / เหตุผลที่ส่งกลับแก้ไข:" : "บันทึกความเห็น:"}
                    </p>
                    <p>{step.comment}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
