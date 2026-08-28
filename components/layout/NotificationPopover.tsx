"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePema } from "@/lib/context/RequestContext";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateThai, formatDateTimeThai } from "@/lib/utils";
import {
  Bell,
  CheckCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  Banknote,
  X,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "warning" | "info" | "success" | "disbursement";
  timestamp: string;
  link: string;
  isRead: boolean;
  code: string;
}

export const NotificationPopover: React.FC = () => {
  const { requests, disbursements } = usePema();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const popoverRef = useRef<HTMLDivElement>(null);

  // Generate dynamic notifications from requests and disbursements
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const list: NotificationItem[] = [];

    // 1. Returned requests (High Priority Urgent)
    requests
      .filter((r) => r.status === "returned")
      .forEach((r) => {
        list.push({
          id: `notif-ret-${r.id}`,
          title: `คำขอ ${r.code} ถูกส่งกลับให้แก้ไข`,
          message: r.returnReason || "มีข้อสังเกตจากผู้อนุมัติ กรุณาตรวจสอบและแก้ไขข้อมูล",
          type: "warning",
          timestamp: r.updatedAt,
          link: `/requests/${r.id}`,
          isRead: false,
          code: r.code,
        });
      });

    // 2. Pending approval requests
    requests
      .filter((r) => r.status === "pending_approval")
      .forEach((r) => {
        list.push({
          id: `notif-pend-${r.id}`,
          title: `คำขอ ${r.code} รอการพิจารณาอนุมัติ`,
          message: `โครงการ "${r.title}" อยู่ระหว่างขั้นตอนตรวจสอบงบประมาณ`,
          type: "info",
          timestamp: r.createdAt,
          link: `/requests/${r.id}`,
          isRead: false,
          code: r.code,
        });
      });

    // 3. Approved requests ready for disbursement
    requests
      .filter((r) => r.status === "approved")
      .forEach((r) => {
        list.push({
          id: `notif-appr-${r.id}`,
          title: `คำขอ ${r.code} ได้รับการอนุมัติแล้ว`,
          message: `วงเงินงบประมาณ ฿${r.totalBudget.toLocaleString()} พร้อมดำเนินการจัดโครงการและเบิกจ่าย`,
          type: "success",
          timestamp: r.updatedAt,
          link: `/requests/${r.id}`,
          isRead: true,
          code: r.code,
        });
      });

    // 4. Disbursements
    disbursements
      .filter((d) => d.status === "paid")
      .forEach((d) => {
        list.push({
          id: `notif-disb-${d.id}`,
          title: `ใบเบิกจ่าย ${d.disbursementCode} โอนเงินเรียบร้อย`,
          message: `จ่ายเงินตามใบเสร็จจริง ฿${d.totalActualAmount.toLocaleString()} ให้แก่ ${d.payeeName}`,
          type: "disbursement",
          timestamp: d.paidAt || d.updatedAt,
          link: `/disbursements/${d.id}`,
          isRead: true,
          code: d.disbursementCode,
        });
      });

    setNotifications(list);
  }, [requests, disbursements]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setIsOpen(false);
  };

  const filteredList =
    filter === "unread" ? notifications.filter((n) => !n.isRead) : notifications;

  const getNotifIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "warning":
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case "disbursement":
        return <Banknote className="w-4 h-4 text-brand-primary" />;
      default:
        return <Clock className="w-4 h-4 text-amber-600" />;
    }
  };

  const getNotifBg = (type: NotificationItem["type"]) => {
    switch (type) {
      case "warning":
        return "bg-orange-50 border-orange-200";
      case "success":
        return "bg-emerald-50 border-emerald-200";
      case "disbursement":
        return "bg-brand-primary/10 border-brand-primary/20";
      default:
        return "bg-amber-50 border-amber-200";
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "p-2 rounded-xl transition-all relative focus-ring touch-target flex items-center justify-center",
          isOpen
            ? "bg-brand-primary/10 text-brand-primary ring-2 ring-brand-primary/30"
            : "text-slate-600 hover:bg-slate-100 hover:text-brand-text"
        )}
        aria-label={`การแจ้งเตือน (${unreadCount} รายการที่ยังไม่ได้อ่าน)`}
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5" />

        {/* Unread Badge Ping */}
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-brand-primary text-white text-[10px] font-bold font-mono shadow-sm animate-scaleUp">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-2xl z-50 overflow-hidden animate-scaleUp"
          role="dialog"
          aria-label="รายการแจ้งเตือน"
        >
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-brand-text">การแจ้งเตือน</h3>
                <p className="text-[11px] text-brand-muted">
                  {unreadCount > 0 ? `${unreadCount} รายการใหม่ที่ต้องดำเนินการ` : "ไม่มีข้อความใหม่"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-[11px] font-semibold text-brand-primary hover:underline px-2 py-1 rounded-md focus-ring flex items-center gap-1"
                  title="อ่านแล้วทั้งหมด"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">อ่านแล้ว</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors focus-ring"
                aria-label="ปิด"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center px-4 py-2 bg-white border-b border-slate-100 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={cn(
                "px-2.5 py-1 rounded-lg font-semibold transition-colors focus-ring",
                filter === "all"
                  ? "bg-brand-primary text-white"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              ทั้งหมด ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={cn(
                "px-2.5 py-1 rounded-lg font-semibold transition-colors focus-ring",
                filter === "unread"
                  ? "bg-brand-primary text-white"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              ยังไม่อ่าน ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {filteredList.length === 0 ? (
              <div className="p-8 text-center text-xs text-brand-muted">
                <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2 opacity-50" />
                ไม่มีรายการแจ้งเตือนในขณะนี้
              </div>
            ) : (
              filteredList.map((item) => (
                <Link
                  key={item.id}
                  href={item.link}
                  onClick={() => markAsRead(item.id)}
                  className={cn(
                    "p-3.5 block hover:bg-slate-50 transition-colors relative group",
                    !item.isRead ? "bg-amber-50/20" : "bg-white"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Status Icon */}
                    <div
                      className={cn(
                        "w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 mt-0.5",
                        getNotifBg(item.type)
                      )}
                    >
                      {getNotifIcon(item.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <p
                          className={cn(
                            "text-xs font-bold text-brand-text truncate",
                            !item.isRead && "text-brand-primary font-extrabold"
                          )}
                        >
                          {item.title}
                        </p>
                        {!item.isRead && (
                          <span className="w-2 h-2 rounded-full bg-brand-primary flex-shrink-0" />
                        )}
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>

                      <div className="flex items-center justify-between pt-1 text-[11px] text-brand-muted">
                        <span className="font-mono">{formatDateTimeThai(item.timestamp)}</span>
                        <span className="text-brand-primary font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                          ดูรายละเอียด <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
            <Link
              href="/requests"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-brand-primary hover:underline py-1 block"
            >
              ดูรายการคำขอโครงการทั้งหมด &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
