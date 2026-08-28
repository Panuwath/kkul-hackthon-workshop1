import React from "react";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  headerActions?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  variant?: "elevated" | "outlined" | "filled";
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  subtitle,
  icon: Icon,
  headerActions,
  footer,
  children,
  className,
  bodyClassName,
  variant = "elevated",
}) => {
  const variantClasses = {
    elevated: "bg-brand-surface border border-slate-200/80 shadow-m3 rounded-2xl",
    outlined: "bg-brand-surface border-2 border-slate-200 rounded-2xl",
    filled: "bg-slate-50 border border-slate-200 rounded-2xl",
  }[variant];

  return (
    <section className={cn("overflow-hidden transition-shadow", variantClasses, className)}>
      {(title || headerActions) && (
        <header className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white/70">
          <div className="flex items-center gap-3 min-w-0">
            {Icon && (
              <div className="w-8 h-8 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0">
              {typeof title === "string" ? (
                <h3 className="font-semibold text-brand-text text-base truncate">{title}</h3>
              ) : (
                title
              )}
              {subtitle && <p className="text-xs text-brand-muted mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
        </header>
      )}

      <div className={cn("p-5", bodyClassName)}>{children}</div>

      {footer && (
        <footer className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between rounded-b-2xl">
          {footer}
        </footer>
      )}
    </section>
  );
};
