import React, { forwardRef } from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DateFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
}

export const DateField = forwardRef<HTMLInputElement, DateFieldProps>(
  (
    {
      id,
      label,
      description,
      error,
      required = false,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const descriptionId = description ? `${id}-description` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const ariaDescribedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

    return (
      <div className="w-full">
        <label
          htmlFor={id}
          className="block text-sm font-semibold text-brand-text mb-1.5"
        >
          {label}
          {required && <span className="text-rose-500 ml-1 font-bold">*</span>}
        </label>

        {description && (
          <p id={descriptionId} className="text-xs text-brand-muted mb-2 leading-relaxed">
            {description}
          </p>
        )}

        <div className="relative">
          <input
            id={id}
            ref={ref}
            type="date"
            aria-required={required}
            aria-invalid={!!error}
            aria-describedby={ariaDescribedBy}
            disabled={disabled}
            className={cn(
              "w-full px-3.5 py-2.5 rounded-xl border text-sm text-brand-text bg-white transition-all",
              "focus:outline-none focus:ring-2 focus:ring-offset-1",
              error
                ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20"
                : "border-slate-300 focus:border-brand-secondary focus:ring-blue-100",
              disabled && "bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200",
              className
            )}
            {...props}
          />

          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Calendar className="w-4 h-4" />
          </div>
        </div>

        {error && (
          <p
            id={errorId}
            role="alert"
            className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1 animate-fadeIn"
          >
            <span>•</span> {error}
          </p>
        )}
      </div>
    );
  }
);

DateField.displayName = "DateField";
