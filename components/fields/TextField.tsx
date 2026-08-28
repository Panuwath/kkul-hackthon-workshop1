import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface TextFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  id: string;
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  typeVariant?: "text" | "number" | "money" | "email" | "tel" | "search";
  prefixText?: string;
  suffixText?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      id,
      label,
      description,
      error,
      required = false,
      typeVariant = "text",
      prefixText,
      suffixText,
      icon: Icon,
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

        <div className="relative flex items-center rounded-xl">
          {Icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Icon className="w-4 h-4" />
            </div>
          )}

          {prefixText && (
            <span className="inline-flex items-center pl-3.5 pr-1.5 text-xs sm:text-sm text-slate-500 font-medium select-none">
              {prefixText}
            </span>
          )}

          <input
            id={id}
            ref={ref}
            type={typeVariant === "money" ? "number" : typeVariant}
            aria-required={required}
            aria-invalid={!!error}
            aria-describedby={ariaDescribedBy}
            disabled={disabled}
            className={cn(
              "w-full px-3.5 py-2.5 sm:py-2.5 rounded-xl border text-sm text-brand-text placeholder:text-slate-400 bg-white transition-all",
              "focus:outline-none focus:ring-2 focus:ring-offset-1",
              error
                ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20"
                : "border-slate-300 focus:border-brand-secondary focus:ring-blue-100",
              disabled && "bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200",
              Icon && "pl-10",
              prefixText && "pl-2",
              suffixText && "pr-12",
              typeVariant === "money" && "font-mono font-medium text-right",
              className
            )}
            {...props}
          />

          {suffixText && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-slate-500 font-medium select-none pointer-events-none">
              {suffixText}
            </span>
          )}
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

TextField.displayName = "TextField";
