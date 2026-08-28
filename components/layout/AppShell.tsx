"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopHeader } from "./TopHeader";
import { usePema } from "@/lib/context/RequestContext";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { error } = usePema();

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col antialiased">
      {/* Sidebar navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main content container (offset for desktop sidebar) */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <TopHeader onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {error && (
            <div
              role="alert"
              className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm"
            >
              <p className="font-semibold">ยังไม่สามารถโหลดข้อมูลจากระบบกลางได้</p>
              <p className="mt-1 text-xs text-amber-800">กรุณาตรวจสอบการเข้าสู่ระบบหรือการเชื่อมต่อ API แล้วลองใหม่อีกครั้ง</p>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};
