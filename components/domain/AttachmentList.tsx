import React from "react";
import { AttachmentItem } from "@/lib/types/pema";
import { FileText, Download, FileSpreadsheet, FileCode, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

interface AttachmentListProps {
  attachments: AttachmentItem[];
  className?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  tor: "เอกสาร TOR / โครงการ",
  schedule: "กำหนดการโครงการ",
  approval_letter: "หนังสืออนุมัติ",
  quotation: "ใบเสนอราคา",
  other: "เอกสารประกอบ",
};

export const AttachmentList: React.FC<AttachmentListProps> = ({
  attachments,
  className,
}) => {
  if (!attachments || attachments.length === 0) {
    return (
      <div className="p-6 text-center rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-brand-muted">
        <Paperclip className="w-5 h-5 mx-auto mb-1.5 text-slate-400" />
        ไม่มีเอกสารแนบในคำขอนี้
      </div>
    );
  }

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls") || fileName.endsWith(".csv")) {
      return FileSpreadsheet;
    }
    if (fileName.endsWith(".pdf")) {
      return FileText;
    }
    return FileCode;
  };

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-3", className)}>
      {attachments.map((item) => {
        const Icon = getFileIcon(item.fileName);

        return (
          <div
            key={item.id}
            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:border-brand-primary/50 hover:bg-brand-primary/5 transition-all gap-3 group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-semibold text-brand-text truncate">
                  {item.fileName}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-brand-muted mt-0.5">
                  <span className="text-brand-secondary font-medium">
                    {CATEGORY_LABELS[item.category] || item.category}
                  </span>
                  <span>•</span>
                  <span>{item.fileSize}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                alert(`ดาวน์โหลดไฟล์: ${item.fileName}`);
              }}
              className="p-2 rounded-lg bg-slate-100 hover:bg-brand-primary hover:text-white text-slate-600 transition-colors focus-ring touch-target flex items-center justify-center flex-shrink-0"
              aria-label={`ดาวน์โหลด ${item.fileName}`}
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
