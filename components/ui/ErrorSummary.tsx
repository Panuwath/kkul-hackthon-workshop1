import React from "react";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FormErrorItem {
  field?: string;
  message: string;
}

interface ErrorSummaryProps {
  title?: string;
  errors: (string | FormErrorItem)[];
  onDismiss?: () => void;
  className?: string;
}

export const ErrorSummary: React.FC<ErrorSummaryProps> = ({
  title = "โปรดตรวจสอบและแก้ไขข้อผิดพลาดต่อไปนี้",
  errors,
  onDismiss,
  className,
}) => {
  if (!errors || errors.length === 0) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "p-4 sm:p-5 rounded-2xl border border-rose-200 bg-rose-50 text-rose-900 mb-6 shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-sm sm:text-base text-rose-950 mb-2">{title}</h4>
            <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-rose-800">
              {errors.map((err, idx) => {
                const message = typeof err === "string" ? err : err.message;
                const field = typeof err !== "string" ? err.field : undefined;
                return (
                  <li key={idx} className="leading-relaxed">
                    {field ? (
                      <a
                        href={`#${field}`}
                        className="underline hover:text-rose-950 font-medium focus-ring rounded"
                      >
                        {message}
                      </a>
                    ) : (
                      <span>{message}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="ปิดกล่องข้อความเตือน"
            className="p-1 rounded-lg text-rose-600 hover:bg-rose-100 transition-colors focus-ring"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
