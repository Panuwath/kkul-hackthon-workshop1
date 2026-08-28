"use client";

import React from "react";
import { Plus, Trash2, User } from "lucide-react";
import { SpeakerItem } from "@/lib/types/pema";
import { MoneyValue } from "@/components/ui/MoneyValue";

interface SpeakerItemArrayProps {
  items: SpeakerItem[];
  onChange: (items: SpeakerItem[]) => void;
  readOnly?: boolean;
}

export const SpeakerItemArray: React.FC<SpeakerItemArrayProps> = ({
  items,
  onChange,
  readOnly = false,
}) => {
  const addSpeaker = () => {
    const newSpeaker: SpeakerItem = {
      id: `spk-${Date.now()}`,
      name: "",
      position: "",
      organization: "",
      type: "external",
      topic: "",
      hours: 3,
      ratePerHour: 1500,
      totalHonorarium: 4500,
    };
    onChange([...items, newSpeaker]);
  };

  const updateSpeaker = (index: number, field: keyof SpeakerItem, value: string | number) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };

    if (field === "hours" || field === "ratePerHour") {
      const hrs = field === "hours" ? Number(value) || 0 : Number(item.hours) || 0;
      const rate = field === "ratePerHour" ? Number(value) || 0 : Number(item.ratePerHour) || 0;
      item.totalHonorarium = hrs * rate;
    }

    updated[index] = item;
    onChange(updated);
  };

  const removeSpeaker = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  if (readOnly && items.length === 0) {
    return (
      <p className="text-xs text-brand-muted italic py-2">ไม่มีข้อมูลวิทยากรในโครงการนี้</p>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((spk, index) => (
        <div
          key={spk.id}
          className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-sm transition-all"
        >
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-brand-text">
                วิทยากรลำดับที่ {index + 1}
              </span>
            </div>

            {!readOnly && (
              <button
                type="button"
                onClick={() => removeSpeaker(index)}
                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors focus-ring"
                aria-label={`ลบวิทยากรลำดับที่ ${index + 1}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {readOnly ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-brand-text">{spk.name || "-"}</p>
                <p className="text-xs text-slate-500">{spk.position} • {spk.organization}</p>
                <p className="text-xs text-brand-primary font-medium mt-1">
                  ประเภท: {spk.type === "external" ? "ผู้ทรงคุณวุฒิภายนอก" : "บุคลากรภายใน"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">หัวข้อบรรยาย:</p>
                <p className="text-sm font-medium text-brand-text">{spk.topic || "-"}</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
                  <span>{spk.hours} ชม. x ฿{spk.ratePerHour}</span>
                  <MoneyValue amount={spk.totalHonorarium} size="sm" highlight />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-brand-text block mb-1">
                    ชื่อ-นามสกุล (พร้อมคำนำหน้า) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={spk.name}
                    placeholder="เช่น ศ.ดร. นันทิยา พิริยพันธุ์"
                    onChange={(e) => updateSpeaker(index, "name", e.target.value)}
                    className="w-full text-sm py-2 px-3 rounded-xl border border-slate-200 bg-white text-brand-text focus-ring"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-brand-text block mb-1">
                    ประเภทวิทยากร
                  </label>
                  <select
                    value={spk.type}
                    onChange={(e) => updateSpeaker(index, "type", e.target.value as "internal" | "external")}
                    className="w-full text-sm py-2 px-3 rounded-xl border border-slate-200 bg-white text-brand-text focus-ring"
                  >
                    <option value="external">ผู้ทรงคุณวุฒิภายนอก</option>
                    <option value="internal">บุคลากรภายในสถาบัน</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-brand-text block mb-1">ตำแหน่งทางวิชาการ / ตำแหน่งงาน</label>
                  <input
                    type="text"
                    value={spk.position}
                    placeholder="เช่น อาจารย์ประจำภาควิชา / ผู้เชี่ยวชาญ"
                    onChange={(e) => updateSpeaker(index, "position", e.target.value)}
                    className="w-full text-sm py-2 px-3 rounded-xl border border-slate-200 bg-white text-brand-text focus-ring"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-brand-text block mb-1">หน่วยงาน / สังกัด</label>
                  <input
                    type="text"
                    value={spk.organization}
                    placeholder="เช่น มหาวิทยาลัย... / บริษัท..."
                    onChange={(e) => updateSpeaker(index, "organization", e.target.value)}
                    className="w-full text-sm py-2 px-3 rounded-xl border border-slate-200 bg-white text-brand-text focus-ring"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-brand-text block mb-1">หัวข้อการบรรยาย / อบรม</label>
                <input
                  type="text"
                  value={spk.topic}
                  placeholder="ระบุหัวข้อที่บรรยาย"
                  onChange={(e) => updateSpeaker(index, "topic", e.target.value)}
                  className="w-full text-sm py-2 px-3 rounded-xl border border-slate-200 bg-white text-brand-text focus-ring"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="text-xs font-semibold text-brand-text block mb-1">ชั่วโมงสอน</label>
                  <input
                    type="number"
                    value={spk.hours || ""}
                    min="1"
                    onChange={(e) => updateSpeaker(index, "hours", e.target.value)}
                    className="w-full text-sm font-mono text-center py-2 px-2.5 rounded-xl border border-slate-200 bg-white focus-ring"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-brand-text block mb-1">อัตรา/ชม. (฿)</label>
                  <input
                    type="number"
                    value={spk.ratePerHour || ""}
                    onChange={(e) => updateSpeaker(index, "ratePerHour", e.target.value)}
                    className="w-full text-sm font-mono text-right py-2 px-2.5 rounded-xl border border-slate-200 bg-white focus-ring"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-brand-text block mb-1">รวมค่าสมนาคุณ</label>
                  <div className="h-10 flex items-center justify-end px-3 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold text-sm text-brand-primary">
                    <MoneyValue amount={spk.totalHonorarium} size="sm" highlight />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {!readOnly && (
        <button
          type="button"
          onClick={addSpeaker}
          className="w-full py-3 border-2 border-dashed border-slate-300 hover:border-brand-primary rounded-2xl text-sm font-semibold text-brand-primary hover:bg-brand-primary/5 flex items-center justify-center gap-2 transition-all focus-ring touch-target"
        >
          <Plus className="w-4 h-4" /> เพิ่มข้อมูลวิทยากร
        </button>
      )}
    </div>
  );
};
