import React from "react";
import { formatMoney } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface MoneyValueProps {
  amount: number | string | undefined | null;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  currencySymbol?: boolean;
  align?: "left" | "right" | "center";
  highlight?: boolean;
  className?: string;
}

export const MoneyValue: React.FC<MoneyValueProps> = ({
  amount,
  size = "md",
  currencySymbol = true,
  align = "right",
  highlight = false,
  className,
}) => {
  const formatted = formatMoney(amount);

  const sizeClasses = {
    sm: "text-xs font-medium",
    md: "text-sm font-semibold",
    lg: "text-base font-bold",
    xl: "text-xl font-extrabold",
    "2xl": "text-2xl sm:text-3xl font-extrabold",
  }[size];

  const alignClasses = {
    left: "text-left justify-start",
    right: "text-right justify-end",
    center: "text-center justify-center",
  }[align];

  return (
    <span
      className={cn(
        "inline-flex items-baseline font-mono tracking-tight tabular-nums",
        alignClasses,
        sizeClasses,
        highlight ? "text-brand-primary" : "text-brand-text",
        className
      )}
    >
      {currencySymbol && (
        <span className="text-[0.8em] text-brand-muted mr-1 font-sans font-normal">
          ฿
        </span>
      )}
      <span>{formatted}</span>
    </span>
  );
};
