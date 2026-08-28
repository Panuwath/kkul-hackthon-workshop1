"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileSpreadsheet,
  PlusCircle,
  Banknote,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  {
    label: "แดชบอร์ด",
    href: "/",
    icon: LayoutDashboard,
    badge: undefined,
  },
  {
    label: "รายการคำขอโครงการ",
    href: "/requests",
    icon: FileSpreadsheet,
    badge: undefined,
  },
  {
    label: "สร้างคำขอใหม่",
    href: "/requests/create",
    icon: PlusCircle,
    highlight: true,
  },
  {
    label: "ระบบเบิกจ่ายงบประมาณ",
    href: "/disbursements",
    icon: Banknote,
    badge: "2",
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  const isNavActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Rail / Drawer */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 w-64 bg-brand-surface border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:shadow-none"
        )}
      >
        {/* Brand Header */}
        <div>
          <div className="h-20 px-5 flex items-center justify-between border-b border-slate-100 bg-white">
            <Link
              href="/"
              onClick={onClose}
              className="flex items-center gap-3 focus-ring rounded-xl py-1 min-w-0"
            >
              <Image
                src="/logo.png"
                alt="Khon Kaen University Logo"
                width={40}
                height={40}
                priority
                unoptimized
                className="h-10 w-auto object-contain flex-shrink-0"
              />
              <div className="border-l border-slate-200 pl-2.5 min-w-0">
                <span className="font-extrabold text-base text-brand-primary tracking-tight block">
                  PEMA
                </span>
                <span className="text-[10px] block font-semibold text-brand-muted uppercase tracking-wider -mt-0.5 truncate">
                  ระบบคำขอ & งบประมาณ
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus-ring flex-shrink-0"
              aria-label="ปิดเมนู"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5" aria-label="Main Navigation">
            <div className="px-3 py-2 text-[11px] font-bold text-brand-muted uppercase tracking-wider">
              เมนูหลัก
            </div>

            {NAV_ITEMS.map((item) => {
              const active = isNavActive(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group focus-ring touch-target",
                    active
                      ? "bg-brand-primary/10 text-brand-primary font-semibold shadow-xs"
                      : "text-slate-600 hover:bg-slate-100/70 hover:text-brand-text",
                    item.highlight && !active && "text-brand-primary bg-brand-primary/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        "w-5 h-5 transition-colors",
                        active
                          ? "text-brand-primary"
                          : "text-slate-400 group-hover:text-slate-600",
                        item.highlight && !active && "text-brand-primary"
                      )}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-800">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info & system settings */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-1">
          <div className="px-3 py-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-xs">
                ดร
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-brand-text truncate">
                  ดร. กิตติศักดิ์ พ.
                </p>
                <p className="text-[10px] text-brand-muted truncate">
                  ฝ่ายเทคโนโลยีสารสนเทศ
                </p>
              </div>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 px-3">
            <span>PEMA v1.0 M3</span>
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
