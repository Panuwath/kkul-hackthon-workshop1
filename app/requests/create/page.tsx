"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { usePema } from "@/lib/context/RequestContext";
import { PemaRequest, ExpenseItem, SpeakerItem, AttachmentItem, ProjectCategory } from "@/lib/types/pema";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { TextField } from "@/components/fields/TextField";
import { SelectField } from "@/components/fields/SelectField";
import { TextareaField } from "@/components/fields/TextareaField";
import { DateField } from "@/components/fields/DateField";
import { FileUploadField } from "@/components/fields/FileUploadField";
import { ExpenseItemArray } from "@/components/domain/ExpenseItemArray";
import { SpeakerItemArray } from "@/components/domain/SpeakerItemArray";
import { TotalsSummary } from "@/components/domain/TotalsSummary";
import { ErrorSummary } from "@/components/ui/ErrorSummary";
import { formatDateThai } from "@/lib/utils";
import {
  Building,
  Target,
  Banknote,
  Users,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Save,
  Send,
  FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { step: 1, title: "ข้อมูลโครงการ", icon: Building },
  { step: 2, title: "ยุทธศาสตร์", icon: Target },
  { step: 3, title: "รายการงบประมาณ", icon: Banknote },
  { step: 4, title: "วิทยากรและเอกสาร", icon: Users },
  { step: 5, title: "ตรวจสอบและส่ง", icon: FileCheck },
];

const CATEGORY_OPTIONS = [
  { value: "training", label: "อบรม / สัมมนา / พัฒนาทักษะ" },
  { value: "research", label: "โครงการวิจัยและสร้างนวัตกรรม" },
  { value: "student_activity", label: "กิจกรรมเสริมศักยภาพนักศึกษา" },
  { value: "procurement", label: "จัดซื้อครุภัณฑ์ / ปรับปรุงระบบ" },
  { value: "service", label: "บริการวิชาการเพื่อสังคม" },
];

const STRATEGY_OPTIONS = [
  { value: "ยุทธศาสตร์ที่ 1: การพลิกโฉมการศึกษาและพัฒนาทักษะแห่งอนาคต (Future Skills)", label: "ยุทธศาสตร์ที่ 1: การพลิกโฉมการศึกษา (Future Skills)" },
  { value: "ยุทธศาสตร์ที่ 2: การวิจัยขั้นแนวหน้าและสร้างนวัตกรรมที่ส่งผลกระทบสูง (Frontier Research)", label: "ยุทธศาสตร์ที่ 2: วิจัยและนวัตกรรมชั้นแนวหน้า (Frontier Research)" },
  { value: "ยุทธศาสตร์ที่ 3: การบริการวิชาการเพื่อสร้างคุณค่าและพัฒนาสังคมอย่างยั่งยืน", label: "ยุทธศาสตร์ที่ 3: บริการวิชาการเพื่อพัฒนาสังคมอย่างยั่งยืน" },
  { value: "ยุทธศาสตร์ที่ 4: การบริหารจัดการองค์กรด้วยธรรมาภิบาลและดิจิทัล", label: "ยุทธศาสตร์ที่ 4: ธรรมาภิบาลและดิจิทัล" },
];

function CreateRequestWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId");

  const { getRequestByIdAsync, createRequest, updateRequest } = usePema();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ field?: string; message: string }[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<PemaRequest>>({
    title: "",
    category: "training",
    department: "ฝ่ายเทคโนโลยีสารสนเทศและการสื่อสาร",
    faculty: "สำนักบริการคอมพิวเตอร์",
    requesterName: "ดร. กิตติศักดิ์ พรหมมินทร์",
    requesterRole: "นักวิชาการคอมพิวเตอร์ชำนาญการ",
    requesterEmail: "kittisak.p@univ.ac.th",
    requesterPhone: "081-234-5678",
    startDate: "2026-09-20",
    endDate: "2026-09-21",
    location: "ห้องอบรม 401 อาคารสารสนเทศ",
    targetAudienceCount: 40,
    objectives: ["เพื่อพัฒนาทักษะความรู้ความสามารถของบุคลากรให้ตรงตามยุทธศาสตร์"],
    rationale: "เพื่อให้สอดคล้องกับแผนยุทธศาสตร์การพัฒนาทักษะดิจิทัลขององค์กร",
    expectedOutcomes: ["ผู้เข้าร่วมสามารถนำความรู้ไปประยุกต์ใช้ในการทำงานได้จริง"],
    strategicPlan: STRATEGY_OPTIONS[0].value,
    kpiAlignment: "KPI 1.2: สัดส่วนบุคลากรที่ได้รับการพัฒนาทักษะดิจิทัลไม่น้อยกว่า 80%",
    sustainableGoal: "SDG 4: การศึกษาที่มีคุณภาพ (Quality Education)",
    expenses: [
      {
        id: "exp-init-1",
        category: "honorarium",
        description: "ค่าสมนาคุณวิทยากร (6 ชม.)",
        unitPrice: 1500,
        quantity: 6,
        unit: "ชั่วโมง",
        total: 9000,
      },
      {
        id: "exp-init-2",
        category: "food",
        description: "ค่าอาหารว่างและเครื่องดื่ม (40 คน x 2 มื้อ)",
        unitPrice: 50,
        quantity: 80,
        unit: "มื้อ",
        total: 4000,
      },
    ],
    speakers: [],
    attachments: [],
    totalBudget: 13000,
    status: "pending_approval",
  });

  // Load existing request data if in edit mode
  useEffect(() => {
    if (!editId) return;
    let cancelled = false;
    void getRequestByIdAsync(editId).then((existing) => {
      if (!cancelled && existing) setFormData(existing);
    });
    return () => {
      cancelled = true;
    };
  }, [editId, getRequestByIdAsync]);

  // Recalculate total budget when expenses change
  const handleExpensesChange = (expenses: ExpenseItem[]) => {
    const total = expenses.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
    setFormData((prev) => ({ ...prev, expenses, totalBudget: total }));
  };

  // Step Validation Logic
  const validateStep = (step: number): boolean => {
    const stepErrors: { field?: string; message: string }[] = [];

    if (step === 1) {
      if (!formData.title?.trim()) {
        stepErrors.push({ field: "title", message: "กรุณาระบุชื่อโครงการ" });
      }
      if (!formData.department?.trim()) {
        stepErrors.push({ field: "department", message: "กรุณาระบุหน่วยงานที่รับผิดชอบ" });
      }
      if (!formData.startDate) {
        stepErrors.push({ field: "startDate", message: "กรุณาระบุวันเริ่มต้นโครงการ" });
      }
      if (!formData.location?.trim()) {
        stepErrors.push({ field: "location", message: "กรุณาระบุสถานที่จัดโครงการ" });
      }
    } else if (step === 2) {
      if (!formData.strategicPlan?.trim()) {
        stepErrors.push({ field: "strategicPlan", message: "กรุณาเลือกยุทธศาสตร์ที่สอดคล้อง" });
      }
      if (!formData.kpiAlignment?.trim()) {
        stepErrors.push({ field: "kpiAlignment", message: "กรุณาระบุตัวชี้วัดความสำเร็จ (KPI)" });
      }
    } else if (step === 3) {
      if (!formData.expenses || formData.expenses.length === 0) {
        stepErrors.push({ field: "expenses", message: "กรุณาระบุรายการค่าใช้จ่ายอย่างน้อย 1 รายการ" });
      }
    }

    setErrors(stepErrors);
    return stepErrors.length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setErrors([]);
      setCurrentStep((prev) => Math.min(prev + 1, 5));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    setErrors([]);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const payload: Partial<PemaRequest> = {
        ...formData,
        status: "draft",
      };

      if (editId) {
        await updateRequest(editId, payload);
      } else {
        await createRequest(payload);
      }

      setNotification({ message: "บันทึกฉบับร่างเรียบร้อยแล้ว", type: "success" });
      router.push("/requests");
    } catch (error) {
      setNotification({ message: error instanceof Error ? error.message : "บันทึกฉบับร่างไม่สำเร็จ", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    // Validate all steps
    const allErrors: { field?: string; message: string }[] = [];
    if (!formData.title?.trim()) allErrors.push({ message: "ข้อมูลโครงการ: กรุณาระบุชื่อโครงการ" });
    if (!formData.strategicPlan?.trim()) allErrors.push({ message: "ยุทธศาสตร์: กรุณาระบุยุทธศาสตร์" });
    if (!formData.expenses || formData.expenses.length === 0) allErrors.push({ message: "งบประมาณ: กรุณาระบุรายการค่าใช้จ่าย" });

    if (allErrors.length > 0) {
      setErrors(allErrors);
      return;
    }

    setIsSaving(true);
    try {
      const payload: Partial<PemaRequest> = {
        ...formData,
        status: "pending_approval",
      };

      let resultId = editId;
      if (editId) {
        const updated = await updateRequest(editId, payload);
        resultId = updated.id;
      } else {
        const created = await createRequest(payload);
        resultId = created.id;
      }

      router.push(`/requests/${resultId}`);
    } catch (error) {
      setNotification({ message: error instanceof Error ? error.message : "ส่งคำขอไม่สำเร็จ", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      <PageHeader
        title={editId ? `แก้ไขคำขอโครงการ (${formData.code || editId})` : "สร้างคำขอโครงการใหม่"}
        subtitle="กรอกข้อมูลคำขอ 5 ขั้นตอน พร้อมระบบตรวจสอบความถูกต้องและคำนวณงบประมาณอัตโนมัติ"
        backHref="/requests"
        breadcrumbs={[
          { label: "หน้าแรก", href: "/" },
          { label: "รายการคำขอ", href: "/requests" },
          { label: editId ? "แก้ไขคำขอ" : "สร้างคำขอใหม่" },
        ]}
        actions={
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors focus-ring touch-target flex items-center gap-1.5 shadow-sm"
          >
            <Save className="w-4 h-4 text-slate-500" />
            <span>บันทึกฉบับร่าง</span>
          </button>
        }
      />

      {/* 5-Step Progress Indicator (Section 5 #4) */}
      <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-m3">
        <div className="flex items-center justify-between overflow-x-auto no-scrollbar gap-2 sm:gap-4">
          {STEPS.map((s, idx) => {
            const isCompleted = currentStep > s.step;
            const isCurrent = currentStep === s.step;
            return (
              <React.Fragment key={s.step}>
                <button
                  type="button"
                  onClick={() => {
                    if (s.step < currentStep || validateStep(currentStep)) {
                      setCurrentStep(s.step);
                    }
                  }}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-xs sm:text-sm font-semibold flex-shrink-0 touch-target focus-ring",
                    isCurrent
                      ? "bg-brand-primary text-white shadow-sm"
                      : isCompleted
                      ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                      : "bg-slate-50 text-slate-400 hover:text-slate-600"
                  )}
                >
                  <div
                    className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold",
                      isCurrent
                        ? "bg-white/20 text-white"
                        : isCompleted
                        ? "bg-emerald-200 text-emerald-900"
                        : "bg-slate-200 text-slate-500"
                    )}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : s.step}
                  </div>
                  <span className="hidden sm:inline">{s.title}</span>
                </button>

                {idx < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 min-w-[12px] transition-colors",
                      isCompleted ? "bg-emerald-400" : "bg-slate-200"
                    )}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          {notification.message}
        </div>
      )}

      {/* Form Error Summary */}
      {errors.length > 0 && (
        <ErrorSummary
          errors={errors}
          onDismiss={() => setErrors([])}
          title="โปรดแก้ไขข้อมูลก่อนดำเนินการต่อ"
        />
      )}

      {/* Wizard Step 1: ข้อมูลโครงการ */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-fadeIn">
          <SectionCard title="ขั้นตอนที่ 1: ข้อมูลทั่วไปของโครงการ" icon={Building}>
            <div className="space-y-4">
              <TextField
                id="title"
                label="ชื่อโครงการ"
                required
                placeholder="เช่น โครงการอบรมเชิงปฏิบัติการพัฒนาทักษะปัญญาประดิษฐ์ (Generative AI)"
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                error={errors.find((e) => e.field === "title")?.message}
                description="ระบุชื่อโครงการให้ชัดเจน สื่อถึงวัตถุประสงค์และกลุ่มเป้าหมาย"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField
                  id="category"
                  label="ประเภทโครงการ"
                  required
                  options={CATEGORY_OPTIONS}
                  value={formData.category || "training"}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as ProjectCategory })}
                />

                <TextField
                  id="department"
                  label="หน่วยงาน / ภาควิชาที่รับผิดชอบ"
                  required
                  placeholder="เช่น ฝ่ายเทคโนโลยีสารสนเทศ"
                  value={formData.department || ""}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  error={errors.find((e) => e.field === "department")?.message}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <DateField
                  id="startDate"
                  label="วันเริ่มต้นจัดโครงการ"
                  required
                  value={formData.startDate || ""}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  error={errors.find((e) => e.field === "startDate")?.message}
                />

                <DateField
                  id="endDate"
                  label="วันสิ้นสุดโครงการ"
                  required
                  value={formData.endDate || ""}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />

                <TextField
                  id="targetAudienceCount"
                  label="จำนวนผู้เข้าร่วมเป้าหมาย (คน)"
                  typeVariant="number"
                  min="1"
                  value={formData.targetAudienceCount || ""}
                  onChange={(e) => setFormData({ ...formData, targetAudienceCount: Number(e.target.value) || 0 })}
                />
              </div>

              <TextField
                id="location"
                label="สถานที่จัดโครงการ"
                required
                placeholder="เช่น ห้องสัมมนา 401 อาคารนวัตกรรมดิจิทัล"
                value={formData.location || ""}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                error={errors.find((e) => e.field === "location")?.message}
              />

              <TextareaField
                id="rationale"
                label="หลักการและเหตุผล"
                rows={3}
                placeholder="ระบุที่มา ความจำเป็น และประโยชน์ที่จะได้รับจากโครงการ..."
                value={formData.rationale || ""}
                onChange={(e) => setFormData({ ...formData, rationale: e.target.value })}
              />
            </div>
          </SectionCard>
        </div>
      )}

      {/* Wizard Step 2: ยุทธศาสตร์ */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-fadeIn">
          <SectionCard title="ขั้นตอนที่ 2: ความสอดคล้องเชิงยุทธศาสตร์และแผนงาน" icon={Target}>
            <div className="space-y-4">
              <SelectField
                id="strategicPlan"
                label="ยุทธศาสตร์มหาวิทยาลัย / องค์กรที่สอดคล้อง"
                required
                options={STRATEGY_OPTIONS}
                value={formData.strategicPlan || STRATEGY_OPTIONS[0].value}
                onChange={(e) => setFormData({ ...formData, strategicPlan: e.target.value })}
                error={errors.find((e) => e.field === "strategicPlan")?.message}
              />

              <TextField
                id="kpiAlignment"
                label="ตัวชี้วัดความสำเร็จของยุทธศาสตร์ (KPI Alignment)"
                required
                placeholder="เช่น KPI 1.2: สัดส่วนบุคลากรที่ได้รับการพัฒนาทักษะดิจิทัลไม่น้อยกว่า 80%"
                value={formData.kpiAlignment || ""}
                onChange={(e) => setFormData({ ...formData, kpiAlignment: e.target.value })}
                error={errors.find((e) => e.field === "kpiAlignment")?.message}
              />

              <TextField
                id="sustainableGoal"
                label="เป้าหมายการพัฒนาที่ยั่งยืน (SDGs ที่เกี่ยวข้อง)"
                placeholder="เช่น SDG 4: การศึกษาที่มีคุณภาพ (Quality Education)"
                value={formData.sustainableGoal || ""}
                onChange={(e) => setFormData({ ...formData, sustainableGoal: e.target.value })}
              />
            </div>
          </SectionCard>
        </div>
      )}

      {/* Wizard Step 3: รายการงบประมาณ */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-fadeIn">
          <SectionCard
            title="ขั้นตอนที่ 3: รายการค่าใช้จ่ายและงบประมาณ"
            subtitle="เพิ่ม/แก้ไขรายการค่าใช้จ่าย ระบบจะคำนวณและตรวจสอบเพดานงบประมาณอัตโนมัติ"
            icon={Banknote}
          >
            <ExpenseItemArray
              items={formData.expenses || []}
              onChange={handleExpensesChange}
            />
          </SectionCard>

          {/* Live Totals Box */}
          <TotalsSummary expenses={formData.expenses || []} />
        </div>
      )}

      {/* Wizard Step 4: วิทยากรและเอกสารแนบ */}
      {currentStep === 4 && (
        <div className="space-y-6 animate-fadeIn">
          <SectionCard
            title="ข้อมูลวิทยากร / ผู้บรรยาย (ถ้ามี)"
            subtitle="สำหรับโครงการที่มีการบรรยาย สัมมนา หรือฝึกอบรม"
            icon={Users}
          >
            <SpeakerItemArray
              items={formData.speakers || []}
              onChange={(speakers: SpeakerItem[]) => setFormData({ ...formData, speakers })}
            />
          </SectionCard>

          <SectionCard
            title="เอกสารแนบประกอบโครงการ"
            subtitle="แนบไฟล์ TOR, กำหนดการ, หรือใบเสนอราคา (สูงสุด 10MB ต่อไฟล์)"
            icon={FileCheck}
          >
            <FileUploadField
              id="attachments"
              label="อัปโหลดเอกสาร"
              attachments={formData.attachments || []}
              onChange={(attachments: AttachmentItem[]) => setFormData({ ...formData, attachments })}
            />
          </SectionCard>
        </div>
      )}

      {/* Wizard Step 5: ตรวจสอบและส่งคำขอ */}
      {currentStep === 5 && (
        <div className="space-y-6 animate-fadeIn">
          <SectionCard title="ขั้นตอนที่ 5: ตรวจสอบความถูกต้องของข้อมูลทั้งหมดก่อนส่งคำขอ" icon={FileCheck}>
            <div className="space-y-6">
              {/* Summary 1: Project */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
                  <h4 className="font-bold text-sm text-brand-text">1. ข้อมูลโครงการ</h4>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs text-brand-primary hover:underline font-semibold"
                  >
                    แก้ไข
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div>
                    <span className="text-brand-muted">ชื่อโครงการ:</span>
                    <p className="font-semibold text-brand-text">{formData.title}</p>
                  </div>
                  <div>
                    <span className="text-brand-muted">หน่วยงาน:</span>
                    <p className="font-semibold text-brand-text">{formData.department}</p>
                  </div>
                  <div>
                    <span className="text-brand-muted">วันที่จัด:</span>
                    <p className="font-semibold text-brand-text">
                      {formatDateThai(formData.startDate)} ถึง {formatDateThai(formData.endDate)}
                    </p>
                  </div>
                  <div>
                    <span className="text-brand-muted">สถานที่:</span>
                    <p className="font-semibold text-brand-text">{formData.location}</p>
                  </div>
                </div>
              </div>

              {/* Summary 2: Strategy */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
                  <h4 className="font-bold text-sm text-brand-text">2. ยุทธศาสตร์และตัวชี้วัด</h4>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-xs text-brand-primary hover:underline font-semibold"
                  >
                    แก้ไข
                  </button>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-brand-text">{formData.strategicPlan}</p>
                <p className="text-xs text-slate-600 mt-1">KPI: {formData.kpiAlignment}</p>
              </div>

              {/* Summary 3: Budget Totals */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-sm text-brand-text">3. รายการงบประมาณรวม</h4>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="text-xs text-brand-primary hover:underline font-semibold"
                  >
                    แก้ไข
                  </button>
                </div>
                <TotalsSummary expenses={formData.expenses || []} />
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {/* Sticky Bottom Action Navigation Bar (Section 7 in README) */}
      <div className="sticky bottom-4 z-20 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl flex items-center justify-between gap-3">
        <div>
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold transition-colors focus-ring touch-target flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" /> ย้อนกลับ
            </button>
          ) : (
            <Link
              href="/requests"
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition-colors focus-ring touch-target flex items-center gap-1.5"
            >
              ยกเลิก
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors focus-ring touch-target"
          >
            <Save className="w-4 h-4 text-slate-500" />
            <span>บันทึกฉบับร่าง</span>
          </button>

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs sm:text-sm font-semibold shadow-sm transition-all focus-ring touch-target flex items-center gap-1.5"
            >
              <span>ถัดไป</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all focus-ring touch-target flex items-center gap-2 active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>{isSaving ? "กำลังส่งข้อมูล..." : "ยืนยันและยื่นคำขอ"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CreateRequestWizardPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-sm font-semibold text-brand-muted">
          กำลังเตรียมแบบฟอร์ม...
        </div>
      }
    >
      <CreateRequestWizardContent />
    </Suspense>
  );
}
