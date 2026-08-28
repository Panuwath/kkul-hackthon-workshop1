"use client";

import React from "react";
import Link from "next/link";
import { Menu, Bell, Plus, Search } from "lucide-react";

interface TopHeaderProps {
  onToggleSidebar: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onToggleSidebar }) => {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between transition-all">
      {/* Left: Mobile Hamburger & Search Trigger */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors focus-ring touch-target flex items-center justify-center"
          aria-label="เปิดเมนู"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 text-xs w-64 border border-transparent focus-within:border-brand-secondary focus-within:bg-white transition-all">
          <Search className="w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="ค้นหาด่วน (Ctrl+K)..."
            className="bg-transparent text-xs text-brand-text outline-none w-full placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Create CTA */}
        <Link
          href="/requests/create"
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold shadow-sm transition-all focus-ring active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>สร้างคำขอใหม่</span>
        </Link>

        {/* Notifications */}
        <button
          type="button"
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors relative focus-ring touch-target flex items-center justify-center"
          aria-label="การแจ้งเตือน"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
        </button>
      </div>
    </header>
  );
};
