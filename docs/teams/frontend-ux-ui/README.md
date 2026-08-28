# PEMA — Frontend UX/UI Team Guide

ทีมรับผิดชอบ: ประสบการณ์ผู้ใช้, หน้าจอ, Material 3 UI และ browser evidence  
อ้างอิง: [Material 3 design spec](../../pema-material3-design-spec.md), [system analysis](../../pema-system-analysis.md), [team delivery map](../README.md)

## 1. Scope

รับผิดชอบ:

- app shell, navigation, dashboard, list, detail และ create wizard
- Material 3 token และ lightweight field wrappers
- form state, client-side feedback และการแสดง error จาก backend
- responsive, keyboard, screen reader, focus และ visual quality
- loading, empty, error, unauthorized, success และ unsaved state

ไม่รับผิดชอบ:

- การตัดสินยอดเงินจริงหรือเพดานเงินจริง
- การอนุมัติสิทธิ์ที่ server
- การแก้ database หรือ deploy

## 2. Frontend baseline

- Next.js App Router
- Server Components เป็นค่าเริ่มต้นสำหรับ dashboard/list/detail
- Client Component ใช้เฉพาะ form, dynamic rows, dialog และ interaction ที่จำเป็น
- TanStack Form + Zod เป็น form standard เดียว
- Tailwind/CSS + Material 3 semantic tokens
- ไม่เพิ่ม Zustand, TanStack Query หรือ UI library ใหญ่ใน MVP

## 3. หน้าจอที่ต้องส่งมอบ

| หน้าจอ | ความสามารถขั้นต่ำ |
|---|---|
| Dashboard | status summary, งานที่ต้องทำ, recent requests, CTA |
| Request list | search, status filter, pagination, loading/empty/error |
| Request detail | project, totals, status timeline, attachments, allowed actions |
| Create wizard | project, strategy, expenses, speakers/files, review/submit |
| Disbursement | list/detail/create จากหลักการที่อนุมัติแล้ว |

## 4. Component ชุดเล็ก

### Foundation

`AppShell`, `Navigation`, `PageHeader`, `SectionCard`, `StatusBadge`, `MoneyValue`, `EmptyState`, `ErrorSummary`, `ConfirmDialog`

### Fields

`TextField`, `SelectField`, `TextareaField`, `DateField`, `FileUploadField`

`TextField` รองรับ text/number/money ผ่าน props เพื่อลด component ซ้ำ ทุก field ต้องมี `id`, `label`, `description`, `error`, `required` และ `aria-describedby`

### Domain

`RequestFilterBar`, `RequestTable`, `RequestCard`, `ApprovalTimeline`, `ExpenseItemArray`, `TrainingSessionArray`, `AttachmentList`, `TotalsSummary`

## 5. UX flow หลัก

1. ผู้ใช้เปิด dashboard และเห็นงานที่ต้องทำก่อนตัวเลขรวม
2. เปิด list แล้วค้นหา/กรองโดย query อยู่ใน URL
3. เปิด detail เพื่ออ่านสถานะ ผู้รับผิดชอบ ยอดรวม และเหตุผลการส่งกลับ
4. สร้างคำขอผ่าน 5 step: project → strategy → expense → speaker/file → review
5. บันทึก draft ได้ทุก step และกลับมาแก้ต่อได้
6. submit/approve/return/cancel ต้องแสดง confirmation หรือ error ที่เข้าใจได้

## 6. Form rules

- render required จาก Zod/schema เดียว ไม่เขียน `*` แยกเอง
- validate เมื่อกด Next และ map server error กลับ field ตาม path
- expense/speaker/file เป็น field array ที่มี stable key
- แสดงยอดรวมจาก server เป็น source of truth หลัง save/submit
- แสดง cap/rate detail ใกล้ field ไม่ซ่อนใน tooltip อย่างเดียว
- ป้องกัน double click และแสดงสถานะกำลังบันทึก
- ใช้ explicit `บันทึกฉบับร่าง` ใน MVP; autosave ค่อยเพิ่มเมื่อมี requirement

## 7. Responsive acceptance

### 320/375/414px

- single column สำหรับ field ยาว
- request/expense/speaker เป็น card หรือ disclosure ไม่บีบเป็น table
- filter chips เลื่อนได้แนวนอน
- action หลักแตะได้อย่างน้อย 48×48px
- sticky action ไม่บัง error และ keyboard
- ไม่มี horizontal overflow ที่ซ่อนข้อมูล

### Desktop

- table อ่านง่าย มี amount ชิดขวาและ status ชัด
- detail ใช้ main content + totals/approval rail
- navigation ใช้ rail/sidebar ตามพื้นที่

## 8. Accessibility checklist

- label ผูกกับ control ด้วย `for/id` หรือ `aria-labelledby`
- error/helper ผูกด้วย `aria-describedby`
- focus ring เห็นชัดและ tab order เป็นธรรมชาติ
- dialog คืน focus ไปยัง trigger
- status ไม่ใช้สีอย่างเดียว
- รองรับข้อความไทยยาวและชื่อหน่วยงานยาว
- ตรวจ contrast, reduced motion และ keyboard-only flow

## 9. Handoff และ acceptance evidence

ส่งให้ Backend:

- field/payload map
- status/action ที่ UI ต้องแสดง
- error path ที่ต้อง focus กลับ
- fixture สำหรับแต่ละ state

ส่งให้ Infrastructure:

- environment URL ที่ใช้ทดสอบ
- route ที่ต้องตรวจหลัง deploy
- screenshot desktop และ 320/375/414px
- console/network issue ที่พบ

ผ่านเมื่อ:

- หน้าจอครบทุก state และไม่มี table overflow
- form ไป-กลับทุก step โดยไม่ล้างค่า
- error จาก API แสดงตรง field
- browser E2E + accessibility + hard reload ผ่าน
