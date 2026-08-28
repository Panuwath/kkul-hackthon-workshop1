# PEMA — Material 3 Design & Engineering Specification

สถานะเอกสาร: Proposed  
เป้าหมาย: ใช้เป็น design baseline สำหรับปรับปรุง PEMA ให้สอดคล้องกับแนวทาง [Material 3 System Starter Template](https://app.notion.com/p/Material-3-System-Starter-Template-3b3f3b3cb76e807e8a16ce85d579ea1f?source=copy_link)

เอกสารทีม: [Frontend UX/UI](./teams/frontend-ux-ui/README.md) · [Backend API](./teams/backend-api/README.md) · [Infrastructure](./teams/infrastructure/README.md) · [Delivery map](./teams/README.md)

## 1. Design intent

PEMA ควรให้ความรู้สึกเป็นระบบราชการ/การเงินที่ **เชื่อถือได้ ชัดเจน ตรวจสอบย้อนกลับได้ และกรอกบนมือถือได้จริง** ไม่ใช่เพียงการเปลี่ยนสีหรือใส่ card แบบ Material เท่านั้น

เป้าหมายหลัก:

- ลดภาระจากฟอร์มยาวด้วย progressive disclosure และ multi-step flow
- ทำให้สถานะ/ผู้รับผิดชอบ/สิ่งที่ต้องทำเข้าใจได้ใน 1 glance
- ทำให้ทุก field, error, cap และยอดรวมมี source of truth เดียว
- รองรับ mobile-first ที่ 320px, 375px และ 414px ตามแนวทางเอกสารอ้างอิง
- ใช้ Material 3 semantic roles, accessible interaction และ responsive primitives
- แยก design system, domain rules, authorization และ data fetching ออกจากกัน

## 2. Alignment กับ Material 3 System Starter Template

เอกสารอ้างอิงที่อ่านได้ระบุแนวทางสำคัญดังนี้:

- v10 ใช้ **TanStack Form เป็นมาตรฐานเดียวของ form** พร้อม Material 3 field adapters
- ใช้ **Zod contracts** สำหรับ sync/async/dynamic validation, array form และ multi-step form
- ใช้การเชื่อมต่อกับ Query อย่างปลอดภัย
- mobile-first ที่ 320/375/414px และต้องมี table-to-card adaptation
- เน้น semantic headings, keyboard navigation, visible focus, label association, `aria-describedby`, focus trap และ WCAG AA
- route-level RBAC ควบคู่ ownership/RLS ระดับข้อมูล
- live table ใช้ tenant-scoped realtime update แล้ว invalidate/update Query cache อย่างจำกัด scope
- การจัดส่งควรมี test, security, a11y, visual evidence, human approval และ dependency/version policy

การนำมาใช้กับ PEMA:

| แนวทางจาก template | การแปลงเป็น PEMA |
|---|---|
| TanStack Form + Zod | ฟอร์มหลักการ/เบิกจ่ายทุก step ใช้ form state และ schema ชุดเดียว |
| M3 field adapters | สร้าง field wrappers ขนาดเล็ก โดยให้ TextField รองรับ text/number/money ผ่าน props |
| Multi-step/array form | รายการงบประมาณ, ค่าใช้จ่ายอื่น, session, speaker และ attachment เป็น field array |
| Table-to-card | รายการคำขอและรายการงบเปลี่ยนเป็น card บน mobile |
| RBAC + ownership/RLS | MVP ใช้ server-side role + ownership check ก่อน; เพิ่ม RLS เมื่อมี direct client DB/multi-tenant requirement |
| Query integration | MVP ใช้ Server Components/Server Actions; เพิ่ม TanStack Query เมื่อมี client cache/live list ที่จำเป็น |
| Evidence gates | ทดสอบ browser จริงที่ mobile/desktop พร้อม screenshot, a11y, console, network และ hard reload |

### Fast-lane decision

ให้เริ่มด้วย **modular monolith** ที่มีชิ้นส่วนน้อย:

```text
Next.js App Router (หนึ่ง repo/หนึ่ง deploy)
  -> M3 tokens + lightweight field wrappers
  -> TanStack Form + Zod
  -> Server Components (read) + Server Actions (write)
  -> PostgreSQL + Prisma (หนึ่ง data access path)
  -> Private object storage สำหรับไฟล์แนบ
```

เลือก auth provider เดียวผ่าน adapter และใช้ helper กลางตรวจ role/ownership ที่ server ทุก mutation

เลื่อนไปหลัง MVP: tRPC, TanStack Query, Zustand, XState, realtime, background jobs, notification service, analytics pipeline และ microservices

## 3. Design principles

### 3.1 Clear before compact

หน้าการเงินต้องอ่านและตรวจได้ก่อน จึงใช้ density ระดับ compact เฉพาะตาราง desktop; mobile ใช้ card และแบ่งข้อมูลเป็นกลุ่ม

### 3.2 One primary action per state

แต่ละหน้ามี action หลักเดียว เช่น `บันทึกฉบับร่าง`, `ส่งตรวจการเงิน`, `อนุมัติ`, `ส่งกลับ` โดย action อื่นลดระดับเป็น secondary/tertiary

### 3.3 Status is data, not decoration

สถานะต้องประกอบด้วย label, semantic color, icon/shape, actor ที่รอ และเวลาที่เปลี่ยนล่าสุด ห้ามใช้สีอย่างเดียวสื่อความหมาย

### 3.4 Progressive disclosure

แสดงข้อมูลที่จำเป็นก่อน ส่วนข้อ 20, rate detail, เอกสาร และกฎพิเศษเปิดเมื่อมีบริบทที่เกี่ยวข้อง

### 3.5 Safe financial interaction

การเปลี่ยนยอด, submit, approve, return และ cancel ต้องมี preview/confirmation ที่บอกผลกระทบชัดเจน ป้องกัน double submit และบันทึก audit

## 4. Provisional Material 3 token foundation

ค่าในตารางเป็น **provisional seed/semantic mapping** จาก visual ที่สังเกตได้ ไม่ใช่ค่าที่ควร hard-code สุดท้าย ให้สร้าง palette จริงด้วย Material Theme Builder แล้ว export เป็น token file

### 4.1 Color roles

| Role | ค่าเริ่มต้น/ที่มา | ใช้กับ |
|---|---|---|
| `primary` | seed จาก maroon เดิมโดยประมาณ `#6B1D2A` | CTA, selected navigation, focus emphasis |
| `on-primary` | generated contrast pair | ข้อความบน primary |
| `primary-container` | generated lighter tonal role | selected filter, summary emphasis |
| `secondary` | warm gold/amber ที่ผ่าน contrast check | secondary action, attention cue |
| `tertiary` | neutral blue/violet สำหรับข้อมูลประกอบ | metadata/analytics ไม่ใช้แทน success/error |
| `surface` | warm neutral ที่อ่านสบาย | page background/card surface |
| `surface-container` | tonal surface ตาม M3 | section, side panel, table header |
| `on-surface` | dark neutral | body text |
| `outline` | neutral border | field/divider |
| `error` | semantic red | validation/rejection/error |
| `success` | semantic green | approved/success โดยมี icon/label ประกอบ |

ไม่ควรใช้สีรุ้งหลายสีเพื่อแยกสถานะโดยไม่มี semantic token เพราะทำให้ theme และ accessibility ควบคุมยาก

### 4.2 Shape, elevation, spacing

```css
:root {
  /* generated color tokens should replace these provisional names */
  --md-sys-color-primary: #6b1d2a;
  --md-sys-color-on-primary: #ffffff;
  --md-sys-color-surface: #fffaf7;
  --md-sys-color-on-surface: #211a1b;
  --md-sys-color-outline: #857375;

  --md-sys-shape-corner-extra-small: 4px;
  --md-sys-shape-corner-small: 8px;
  --md-sys-shape-corner-medium: 12px;
  --md-sys-shape-corner-large: 16px;

  --pema-space-1: 4px;
  --pema-space-2: 8px;
  --pema-space-3: 12px;
  --pema-space-4: 16px;
  --pema-space-6: 24px;
  --pema-space-8: 32px;
}
```

กติกา:

- touch target อย่างน้อย 48×48px
- field สูงอย่างน้อย 48px และมี label ลอย/outlined ที่ไม่พึ่ง placeholder
- ใช้ tonal surface/elevation เพื่อแบ่ง hierarchy ไม่ใช้ shadow หนักทุก card
- body text ใช้ Sarabun หรือ font ที่รองรับ Thai ครบ; ตรวจ line-height กับข้อความยาว
- dark theme และ high-contrast variant ต้องอาศัย semantic roles เดียวกัน

### 4.3 Type scale

- page title: headline/small หรือเทียบเท่า ให้ hierarchy ชัด
- section title: title/medium
- table/card title: title/small
- body: body/medium
- helper/error/meta: body/small แต่ต้องไม่เล็กจนอ่านยาก
- จำนวนเงิน: ใช้ tabular numerals/align ขวา และ label สกุลเงินชัดเจน

## 5. App shell และ navigation

### Desktop

- ใช้ responsive navigation rail/sidebar ที่ขยายเป็น sidebar เมื่อมีพื้นที่
- แสดง 3 destination หลัก: Dashboard, หลักการ, เบิกจ่าย
- แสดงปีงบประมาณ/หน่วยงานใน context bar ถ้ามีหลาย scope
- user menu รวม profile, role, help และ sign out

### Mobile

- ใช้ top app bar ที่มี menu button accessible และ page title
- เปิด navigation drawer ที่มี destination เดิม ไม่ทำให้เมนูหายจาก accessibility tree
- ใช้ safe-area padding และไม่วาง action สำคัญชิดขอบจอ
- action หลักของ form อยู่ใน sticky bottom action bar เมื่อไม่บัง error/keyboard

## 6. หน้าจอเป้าหมาย

### 6.1 Dashboard

โครงสร้าง:

1. page header: สวัสดี + role + ปีงบประมาณ
2. primary action: สร้างคำขอหลักการ
3. “งานของฉัน” เป็น task list ที่มีสิ่งต้องทำก่อน
4. summary cards ของหลักการและเบิกจ่าย
5. recent requests
6. quick filters / help

Summary card ต้องกดได้ทั้ง card และ action ที่มีชื่อชัด, แสดง selected state และไปยัง URL filter ได้ ไม่ควรเป็นเพียงเลขที่ไม่มีบริบท

### 6.2 Request list

desktop:

- outlined search field + filter chips + advanced filter menu
- table header sticky เมื่อ scroll
- amount ชิดขวา, status เป็น StatusBadge, action เป็น overflow menu
- pagination แสดงจำนวนและ page size

mobile:

- filter chips เลื่อนแนวนอนได้และมีปุ่มเปิด advanced filter
- ใช้ `RequestCard` แทน table column ที่แคบ
- card แสดงเลขที่/ชื่อ/ยอด/สถานะ/วันที่/next action
- แตะ card เปิด detail; action สำคัญมีปุ่มใหญ่และไม่ซ่อนใน gesture

### 6.3 Request detail

ควรเป็นหน้าที่ขาดหายจาก path ที่สังเกตได้เมื่อไม่มี data และควรมี:

- header: เลขที่, project name, status, owner
- status timeline + current approver + elapsed time
- section accordion: project, strategy, expenses, speakers, attachments
- total summary ที่ sticky บน desktop และ bottom summary บน mobile
- audit/activity log
- action ตาม role: edit draft, submit, approve, return, cancel, create disbursement

### 6.4 Create form wizard

แบ่งเป็น 5 step:

| Step | เนื้อหา | ออกจาก step เมื่อ |
|---|---|---|
| 1 | ข้อมูลโครงการ/วันเวลา/สถานที่ | required project fields valid |
| 2 | งบประมาณ/ยุทธศาสตร์/ผู้เข้าร่วม | code/rules valid |
| 3 | ข้อ 20 + ค่าใช้จ่ายหลัก/อื่นๆ | budget items valid and totals calculated |
| 4 | session/วิทยากร/ไฟล์แนบ | speaker cap and attachments valid |
| 5 | review/consent/submit | user confirms summary and action |

แต่ละ step ต้อง:

- validate เมื่อกด Next และ validate server ซ้ำตอน save/submit
- แสดง error summary ที่กดเพื่อ focus กลับ field ได้
- เก็บ draft state เมื่อเปลี่ยน step
- มี `บันทึกฉบับร่าง` ที่ทำงานได้ทุก step
- บอก “บันทึกล่าสุดเมื่อ…” และสถานะ unsaved
- รองรับ back/forward โดยไม่ล้างค่า

## 7. Component inventory

### Foundation

- `PemaThemeProvider`
- `PemaAppShell`
- `PemaNavigation`
- `PageHeader`
- `SectionCard`
- `StatusBadge`
- `MoneyValue`
- `EmptyState`
- `ErrorSummary`
- `ConfirmActionDialog`

### Field adapters

- `OutlinedTextField` รองรับ text/number/money ผ่าน props
- `OutlinedSelectField` รองรับ select/radio/checkbox ผ่าน variant ที่จำเป็น
- `OutlinedTextareaField`
- `OutlinedDateField`
- `FileUploadField`

ทุก field ต้องรับ `id`, `label`, `description`, `error`, `required`, `disabled`, `aria-describedby` และเชื่อมต่อกับ TanStack Form field state ไม่สร้าง input ad hoc ใน page

### Domain components

- `StatusSummaryCard`
- `RequestFilterBar`
- `RequestTable`
- `RequestCard`
- `ApprovalTimeline`
- `ExpenseItemArray`
- `ExpenseItemRow`
- `ExpenseItemCard`
- `OtherExpenseArray`
- `TrainingSessionArray`
- `SpeakerArray`
- `AttachmentList`
- `TotalsSummary`
- `DraftSaveIndicator`

## 8. Lean form/data architecture

### One simple boundary

```text
M3 Field Wrapper
  -> TanStack Form
  -> Zod schema/refinement
  -> Server Action
  -> authorization + transaction
  -> PostgreSQL + Prisma
```

ข้อกำหนดที่คงไว้เพราะสำคัญต่อความถูกต้อง:

- TanStack Form เป็น form state standard เดียว
- Zod เป็น contract ระหว่าง client/server และเป็น source of truth ของ required/error
- field array ใช้ stable key
- server คำนวณยอด, เพดาน และ status transition ใหม่ทุกครั้ง
- approval/financial mutation ใช้ server response เป็น source of truth และกัน double submit

สิ่งที่ไม่ต้องสร้างในรอบแรก:

- REST API ครบทุก endpoint หากยังไม่มี external consumer
- tRPC/query cache ถ้าอ่านข้อมูลผ่าน Server Components ได้
- global client state ถ้า state อยู่ใน form/URL ได้
- schema/entity แยกย่อยเกินจำเป็น; รวม `OtherExpense` ไว้ใน `ExpenseItem` ด้วย category ได้

### Minimal form shape

```ts
type ExpenseRequestForm = {
  project: ProjectFields;
  strategy: StrategyFields;
  expenses: ExpenseItem[];
  sessions: TrainingSession[];
  attachments: AttachmentDraft[];
};
```

รายละเอียด enum และ entity ให้เริ่มจากข้อมูลที่ใช้งานจริง แล้วค่อยแยกเมื่อมีเหตุผลด้าน query/ownership

## 9. Responsive rules

### 320px

- single column ทุก field
- ห้ามมี table ที่มี min-width ใหญ่กว่าหน้าจอโดยไม่มี scroll affordance
- summary เป็น stacked cards
- long labels wrap ได้โดยไม่ตัดกลางคำ
- action bar จัดเป็น full-width หรือ 2 ปุ่มที่กดง่าย

### 375px

- ใช้เป็น acceptance baseline หลักสำหรับผู้ใช้มือถือทั่วไป
- filter chips scroll ได้
- expense/speaker rows เป็น cards ที่แสดงเฉพาะข้อมูลสำคัญ และมี “ดูรายละเอียด”

### 414px

- อนุญาต 2-column เฉพาะ field สั้นที่ปลอดภัย เช่น จำนวน/หน่วย
- ห้ามบังคับ 2-column กับชื่อโครงการ, หน่วยงาน, textarea และ select ข้อยาว

### Desktop

- max content width ประมาณ 1200–1280px ตาม density จริง
- table ใช้ column width ที่กำหนดและ sticky action column เมื่อจำเป็น
- detail page ใช้ two-column: main content + totals/approval rail

## 10. Accessibility checklist

- ทุก control มี accessible name จาก `<label for>` หรือ `aria-labelledby`
- helper/error เชื่อมด้วย `aria-describedby`
- error summary focus ได้หลัง submit/Next ที่ไม่ผ่าน
- focus ring เห็นชัดทั้ง light/dark theme
- keyboard ใช้กับ chips, menus, dialogs, dynamic rows และ file actions ได้
- dialog มี focus trap และคืน focus ไปยัง trigger
- status ไม่ใช้สีอย่างเดียว; มีข้อความ/icon/shape
- contrast ผ่าน WCAG AA โดยเฉพาะสี maroon/gold บนพื้นผิวอ่อน
- reduced motion ลด transition/animation ที่ไม่จำเป็น
- screen reader อ่านยอดเงินพร้อมหน่วยและสถานะได้
- touch target ไม่น้อยกว่า 48px
- ทดสอบข้อความภาษาไทยยาว, ชื่อหน่วยงานยาว และ label ข้อความกฎระเบียบ

## 11. Security, authorization และ audit แบบ MVP

- ตรวจ role + ownership/scope ที่ server ทุก mutation; อย่าพึ่งการซ่อนปุ่ม
- approval transition ใช้ allow-list ของ current state + actor scope
- ใช้ auth/session/CSRF ตาม provider เดียว; sign out ไม่ควรเป็น unsafe GET mutation
- upload ใช้ private storage, server-side type/size check และ signed URL
- เก็บ audit เฉพาะ action สำคัญ: save draft, submit, approve, return, cancel, amount change, upload failure
- log ห้ามมี token, cookie, password หรือ request body ที่มีข้อมูลส่วนตัว
- ถ้าเลือก Supabase ให้เปิด RLS และใช้ Supabase เป็น data access path เดียว; ถ้าเลือก Prisma ให้บังคับ ownership ที่ server

## 12. Observability แบบพอดี

เริ่มด้วย structured log + audit table + error tracking ของ action สำคัญ ไม่ต้องทำ event platform แยก:

`draft_saved`, `submitted`, `approved`, `returned`, `cancelled`, `upload_failed`, `unauthorized`

Realtime, notification และ analytics ให้เพิ่มเมื่อมี requirement วัดผลชัดเจน โดยไม่ทำให้ core transaction รอ service อื่น

## 13. Testing and delivery gates แบบสั้น

### Component/unit

- money formatting/rounding
- rate cap และ unit conversion
- date range
- speaker count per session/group
- required/conditional attachment
- status transition guard

### Browser E2E

- create draft → reload → resume
- complete wizard → submit to finance
- rate over cap → error/override behavior
- add/edit/remove expense row
- add session/speaker and hit each speaker limit
- upload invalid/oversized file
- finance return with reason → owner edits/resubmits
- unauthorized user cannot see or mutate another scope
- disbursement starts only from fully approved principle

### Visual/a11y

- screenshot at desktop, 320, 375, 414px
- no horizontal overflow from body or hidden table
- no overlap/clipped menu/sticky action/error
- keyboard-only flow
- axe/ARIA inspection and screen reader spot check
- hard reload after navigation and after mutation
- inspect console errors and failed network requests

### Release

- typecheck, lint, unit, browser E2E, accessibility และ visual checks ผ่าน
- ตรวจ authorization/upload และ migration ที่กระทบยอดเงิน
- production health + authenticated UI readback หลัง hard reload

## 14. Migration roadmap แบบ 4 phase

1. **Foundation** — Next.js shell, M3 tokens, field wrappers, auth adapter, status enum
2. **Read** — dashboard/list/detail, search/filter, mobile card และ loading/error/empty state
3. **Write** — wizard, draft, expense/speaker/attachment, submit/return/approve
4. **Cutover** — reconcile ยอด/status กับระบบเดิม, pilot กับ role จริง, production readback

เลื่อนไปหลัง cutover: realtime, notification, analytics, bulk review, export ขั้นสูง และ service แยก

## 15. Definition of done สำหรับ design/engineering

- มี `DESIGN.md`/เอกสารนี้เป็น source of truth และระบุ decision ที่เปลี่ยนยาก
- ไม่มี ad hoc admin input นอก field component system
- form ทุกตัวใช้ TanStack Form + Zod contract
- mobile baseline ผ่าน 320/375/414px
- table/card, status, error, loading, empty และ permission state ครบ
- keyboard/screen reader/focus/contrast ผ่าน acceptance checklist
- financial mutation มี confirmation ที่เหมาะสม, idempotency และ audit
- browser evidence แสดงหน้าจอจริงหลัง hard reload; test ผ่านอย่างเดียวไม่ถือว่าเสร็จ

## 16. Design decisions ที่ควรบันทึกเป็น ADR

1. **MVP stack** — Next.js + Server Actions + TanStack Form/Zod + PostgreSQL/Prisma เป็น baseline เดียว
2. **Workflow/security** — status/role matrix, ownership และกฎการส่งกลับ
3. **Data migration** — rate catalog, attachment retention และ cutover จาก `/pema/expense/store`
