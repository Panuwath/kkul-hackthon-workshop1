"use client";

import React, { useEffect, useRef } from "react";
import { AlertCircle, CheckCircle2, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "primary" | "danger" | "warning" | "success";
  isLoading?: boolean;
  children?: React.ReactNode;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "ยืนยัน",
  cancelLabel = "ยกเลิก",
  variant = "primary",
  isLoading = false,
  children,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
      setTimeout(() => confirmBtnRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const variantIcons = {
    primary: { icon: CheckCircle2, bg: "bg-blue-50 text-brand-primary" },
    success: { icon: CheckCircle2, bg: "bg-emerald-50 text-emerald-600" },
    warning: { icon: AlertTriangle, bg: "bg-amber-50 text-amber-600" },
    danger: { icon: AlertCircle, bg: "bg-rose-50 text-rose-600" },
  }[variant];

  const confirmBtnStyles = {
    primary: "bg-brand-primary hover:bg-brand-primary-hover text-white focus:ring-brand-primary",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-600",
    warning: "bg-amber-500 hover:bg-amber-600 text-white focus:ring-amber-500",
    danger: "bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-600",
  }[variant];

  const Icon = variantIcons.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
      ref={dialogRef}
    >
      <div className="bg-brand-surface w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-scaleUp">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                variantIcons.bg
              )}
            >
              <Icon className="w-5 h-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h3
                  id="dialog-title"
                  className="text-lg font-bold text-brand-text tracking-tight"
                >
                  {title}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus-ring"
                  aria-label="ปิดกล่องข้อความ"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div id="dialog-description" className="mt-2 text-sm text-brand-muted leading-relaxed">
                {description}
              </div>

              {children && <div className="mt-4">{children}</div>}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-sm font-medium transition-colors focus-ring touch-target flex items-center justify-center"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              "px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-all focus-ring touch-target flex items-center justify-center",
              confirmBtnStyles,
              isLoading && "opacity-75 cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                กำลังดำเนินการ...
              </span>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
