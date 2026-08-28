# PEMA — Backend API Team Guide

ทีมรับผิดชอบ: domain rule, persistence, server action, authorization และ audit  
อ้างอิง: [system analysis](../../pema-system-analysis.md), [team delivery map](../README.md)

## 1. Scope

รับผิดชอบ:

- minimal domain model และ status transition
- server-side validation, totals และ rate cap
- Server Actions สำหรับธุรกรรมหลัก
- read functions สำหรับ dashboard/list/detail
- role/ownership authorization
- attachment metadata และ audit event

ไม่รับผิดชอบ:

- layout, CSS และ responsive behavior
- provisioning/deploy/backup
- การอนุมัติแทนผู้ใช้จริง

## 2. Backend baseline

- อยู่ใน Next.js app เดียวแบบ modular monolith
- PostgreSQL + Prisma เป็น baseline เดียว
- Server Components เรียก repository/read functions
- Server Actions ใช้กับ save/submit/review/cancel
- Route Handler ใช้เฉพาะ upload/download/webhook ที่จำเป็น
- ยังไม่ทำ tRPC, API gateway, microservice, realtime หรือ background worker

## 3. Minimal domain model

เริ่มจาก entity เท่าที่จำเป็น:

`User/Role`, `Department`, `ExpenseRequest`, `ExpenseItem`, `TrainingSession/Speaker`, `Attachment`, `ApprovalEvent`, `RateCatalog`

แนวทางลดความซับซ้อน:

- รวมค่าใช้จ่ายอื่นไว้ใน `ExpenseItem.category`
- รวมประวัติการอนุมัติไว้ใน `ApprovalEvent` โดยเก็บ before/after/reason/actor/time
- เก็บยอดรวมที่คำนวณได้เพื่อ read performance ได้ แต่ต้องคำนวณตรวจซ้ำจากรายการ
- rate catalog ต้องมีปี/เวอร์ชันเพื่อรองรับประกาศใหม่

## 4. Server contract

ใช้ functions ภายในเป็น contract หลักก่อน:

```ts
getRequests(filters)
getRequest(id)
saveDraft(input)
submitRequest(id)
reviewRequest(id, decision, reason)
createDisbursement(expenseId, input)
```

ผลลัพธ์มาตรฐาน:

```ts
type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string; fieldErrors?: Record<string, string[]> };
```

ถ้ามี external consumer จริงจึงค่อยเพิ่ม Route Handler/API endpoint และเขียน contract แยก

## 5. Status transition

```text
DRAFT
  -> PENDING_FINANCE
  -> PENDING_DIRECTOR
  -> PENDING_DEAN
  -> PENDING_VICE_RECTOR
  -> PENDING_RECTOR
  -> FULLY_APPROVED

ทุก pending state -> RETURNED (ต้องมีเหตุผล)
ทุก draft/returned -> แก้ไขและ submit ใหม่
FULLY_APPROVED -> DISBURSEMENT_DRAFT
```

กฎ:

- ตรวจ current status + actor scope ก่อนเปลี่ยนทุกครั้ง
- ใช้ transaction และ optimistic concurrency สำหรับ approval
- approve/return/cancel ต้อง idempotent หรือ reject duplicate action อย่างชัดเจน
- ห้ามรับ `grandTotal` จาก client เป็น source of truth

## 6. Validation และ security

- ใช้ Zod schema ร่วมกับ frontend เท่าที่ทำได้ และ server validate ซ้ำเสมอ
- ตรวจ date range, required field, numeric range, code length, rate cap และ speaker limit
- field ที่ UI มี `*` ต้องมี server rule ที่ตรงกัน
- role + ownership/department scope ตรวจที่ server ทุก mutation
- upload ตรวจ MIME/extension/size/content และเก็บไฟล์ใน private storage
- attachment download ใช้ signed URL หรือ authorization gate
- submit ต้องตรวจ permission, current status และข้อมูลล่าสุดใหม่ทั้งหมด

## 7. Audit และ error handling

Audit ขั้นต่ำสำหรับ:

`draft_saved`, `submitted`, `approved`, `returned`, `cancelled`, `amount_changed`, `upload_failed`, `unauthorized`

เก็บ actor, entity, action, before/after status, reason, timestamp และ request id โดยไม่เก็บ token, password หรือ request body ทั้งก้อน

Error code ขั้นต่ำ:

`VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `STALE_STATE`, `RATE_EXCEEDED`, `UPLOAD_INVALID`

## 8. Backend MVP ที่ implement แล้ว

โค้ดอยู่ใน `server/requests` และใช้ REST Route Handler เป็นขอบเขตที่ frontend เรียกได้ทันที:

| Method | Endpoint | หน้าที่ |
|---|---|---|
| `GET` | `/pema/api/health` | ตรวจ app และ database โดยไม่ต้อง login |
| `GET` | `/pema/api/requests` | รายการแบบ pagination, status filter และ search |
| `POST` | `/pema/api/requests` | สร้างฉบับร่าง พร้อมคำนวณยอดจากรายการฝั่ง server |
| `GET` | `/pema/api/requests/:id` | ดูรายละเอียดตามสิทธิ์ |
| `PATCH` | `/pema/api/requests/:id` | แก้ draft/returned โดยต้องส่ง `version` |
| `POST` | `/pema/api/requests/:id/submit` | ส่งเข้า `PENDING_FINANCE` |
| `POST` | `/pema/api/requests/:id/review` | approve/return ตาม role และสถานะ |
| `POST` | `/pema/api/requests/:id/disbursements` | สร้าง draft เบิกจ่ายจากรายการที่อนุมัติแล้ว |

ทุก response ใช้รูปแบบ `{ data, meta: { requestId } }` หรือ `{ error: { code, message, details? }, meta }` และ mutation ที่มีความเสี่ยงใช้ transaction + optimistic concurrency (`version`) แล้ว

Auth มี adapter สองโหมด: `AUTH_MODE=dev` ใช้ header สำหรับ local เท่านั้น และ `AUTH_MODE=jwt` ใช้ Bearer JWT สำหรับ production โดย production จะไม่ยอมรับ dev header

## 9. Testing และ handoff

ต้องมี test สำหรับ:

- totals/rate cap/date/speaker limits
- status transition และ unauthorized access
- duplicate submit/stale state
- draft → reload → resume
- return with reason → edit → resubmit
- disbursement สร้างได้เฉพาะจาก `FULLY_APPROVED`

ส่งให้ Frontend:

- enum/status label map
- input/output type
- field error path
- allowed action ต่อ role/status
- fixture data ครบ state

ส่งให้ Infrastructure:

- migration command/order
- required environment variable names
- health check และ log fields
- backup/restore หรือ rollback requirement ที่เกี่ยวกับ schema
