import type { Metadata } from "next";
import "./globals.css";
import { RequestProvider } from "@/lib/context/RequestContext";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "PEMA — ระบบบริหารคำขอโครงการและงบประมาณ",
  description:
    "Project & Expense Management Application ออกแบบตามหลัก Material 3 UX/UI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="bg-brand-bg text-brand-text min-h-screen">
        <RequestProvider>
          <AppShell>{children}</AppShell>
        </RequestProvider>
      </body>
    </html>
  );
}
