"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, FileText, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import { AttachmentItem } from "@/lib/types/pema";
import { cn } from "@/lib/utils";

interface FileUploadFieldProps {
  id: string;
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  attachments: AttachmentItem[];
  onChange: (attachments: AttachmentItem[]) => void;
  maxSizeMB?: number;
  acceptedTypes?: string[];
}

export const FileUploadField: React.FC<FileUploadFieldProps> = ({
  id,
  label,
  description,
  error,
  required = false,
  attachments,
  onChange,
  maxSizeMB = 10,
  acceptedTypes = [".pdf", ".docx", ".xlsx", ".zip", ".jpg", ".png"],
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);

    const newAttachments: AttachmentItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > maxSizeMB * 1024 * 1024) {
        setUploadError(`ไฟล์ "${file.name}" มีขนาดเกิน ${maxSizeMB}MB`);
        continue;
      }

      const sizeStr =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`;

      newAttachments.push({
        id: `att-${Date.now()}-${i}`,
        fileName: file.name,
        fileSize: sizeStr,
        fileType: file.type || "application/octet-stream",
        uploadedAt: new Date().toISOString(),
        category: file.name.toLowerCase().includes("tor")
          ? "tor"
          : file.name.toLowerCase().includes("schedule")
          ? "schedule"
          : "other",
      });
    }

    onChange([...attachments, ...newAttachments]);
  };

  const removeAttachment = (attId: string) => {
    onChange(attachments.filter((a) => a.id !== attId));
  };

  const updateCategory = (attId: string, category: AttachmentItem["category"]) => {
    onChange(
      attachments.map((a) => (a.id === attId ? { ...a, category } : a))
    );
  };

  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-semibold text-brand-text mb-1.5">
        {label}
        {required && <span className="text-rose-500 ml-1 font-bold">*</span>}
      </label>

      {description && (
        <p className="text-xs text-brand-muted mb-2 leading-relaxed">{description}</p>
      )}

      {/* Drag & Drop Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all bg-white hover:bg-brand-primary/5",
          isDragging
            ? "border-brand-primary bg-brand-primary/10 scale-[1.01]"
            : "border-slate-300 hover:border-brand-primary",
          error && "border-rose-400 bg-rose-50/20"
        )}
      >
        <input
          ref={fileInputRef}
          id={id}
          type="file"
          multiple
          accept={acceptedTypes.join(",")}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-3 shadow-sm">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-brand-text">
            คลิกเพื่ออัปโหลด หรือลากไฟล์มาวางที่นี่
          </p>
          <p className="text-xs text-brand-muted mt-1">
            รองรับไฟล์ {acceptedTypes.join(", ")} (ขนาดสูงสุด {maxSizeMB}MB ต่อไฟล์)
          </p>
        </div>
      </div>

      {(error || uploadError) && (
        <p
          role="alert"
          className="text-xs text-rose-600 font-medium mt-2 flex items-center gap-1 animate-fadeIn"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{uploadError || error}</span>
        </p>
      )}

      {/* Uploaded Files List */}
      {attachments.length > 0 && (
        <div className="mt-4 space-y-2.5">
          <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
            เอกสารที่แนบแล้ว ({attachments.length})
          </p>

          <div className="space-y-2">
            {attachments.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors gap-3"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-brand-text truncate">
                      {item.fileName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-brand-muted">
                      <span>{item.fileSize}</span>
                      <span>•</span>
                      <span className="text-emerald-600 flex items-center gap-0.5">
                        <CheckCircle className="w-3 h-3" /> พร้อมส่ง
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <select
                    value={item.category}
                    onChange={(e) =>
                      updateCategory(item.id, e.target.value as AttachmentItem["category"])
                    }
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus-ring"
                    aria-label={`ประเภทเอกสารสำหรับ ${item.fileName}`}
                  >
                    <option value="tor">เอกสาร TOR / โครงการ</option>
                    <option value="schedule">กำหนดการ</option>
                    <option value="approval_letter">หนังสืออนุมัติ</option>
                    <option value="quotation">ใบเสนอราคา</option>
                    <option value="other">เอกสารอื่นๆ</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => removeAttachment(item.id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors focus-ring"
                    aria-label={`ลบไฟล์ ${item.fileName}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
