# PEMA — Team Delivery Map

สถานะ: Proposed  
เป้าหมาย: แบ่งงานและเอกสารให้ทีมพัฒนาเดินงานขนานกันได้เร็ว โดยใช้ boundary ที่เล็กและชัดเจน

## เอกสารทีม

- [Frontend UX/UI](./frontend-ux-ui/README.md)
- [Backend API](./backend-api/README.md)
- [Infrastructure](./infrastructure/README.md)
- [System analysis](../pema-system-analysis.md)
- [Material 3 design spec](../pema-material3-design-spec.md)

## Fast-lane baseline

```text
หนึ่ง repository
หนึ่ง Next.js app
หนึ่ง deploy
หนึ่ง PostgreSQL + Prisma
หนึ่ง auth provider
หนึ่ง private object storage
```

มาตรฐานร่วม: Material 3 tokens, TanStack Form + Zod, Server Components สำหรับ read และ Server Actions สำหรับ write

ยังไม่เพิ่มใน MVP: microservices, API gateway, tRPC, client cache library, realtime, background jobs, notification service และ analytics pipeline

## Responsibility matrix

| เรื่อง | Frontend UX/UI | Backend API | Infrastructure |
|---|---|---|---|
| UX flow / screen / responsive | Owner | Consult | Consult |
| M3 tokens / components | Owner | - | - |
| Form state / field error | Owner | Contract owner | - |
| Business validation / totals | Display | Owner | - |
| Status transition / permission | Display allowed action | Owner | Support runtime |
| Database schema / migration | - | Owner | Run/backup |
| Auth provider / secrets | Consume session | Integrate guard | Owner |
| File storage / upload policy | Upload UI | Metadata/permission | Storage/backup |
| Deploy / domain / monitoring | Verify UI | Verify API | Owner |
| Browser/a11y evidence | Owner | Support test data | Support environment |

## Handoff contract

### Backend → Frontend

- status enum และ label map
- input/output type ของ `getRequests`, `getRequest`, `saveDraft`, `submitRequest`, `reviewRequest`, `createDisbursement`
- field error format ที่มี `path`, `code`, `message`
- pagination/filter shape
- allowed actions ต่อสถานะ/role
- fixture ข้อมูลสำหรับ empty, draft, rejected, pending และ approved

### Frontend → Backend

- field id/name ที่ stable
- payload ที่ส่งจริงและเงื่อนไขของแต่ละ step
- UX ที่ต้องการสำหรับ loading, conflict, upload failure และ permission denied
- screenshot/evidence ของ desktop และ 320/375/414px

### Infrastructure → ทุกทีม

- URL ของ local/staging/production
- environment variable names โดยไม่ส่งค่า secret ในเอกสาร
- database/storage/auth access ที่จำเป็น
- migration/rollback และ backup/restore procedure
- health check และ log location

## ลำดับการทำงานที่เร็วที่สุด

1. Infrastructure เตรียม app, database, storage และ auth integration skeleton
2. Backend กำหนด status enum, minimal schema และ server function contract
3. Frontend ทำ app shell, M3 tokens, list/detail และ wizard จาก fixture
4. Backend เชื่อม persistence, validation, authorization และ audit
5. Frontend/Backend integrate แล้วตรวจ workflow จริง
6. Infrastructure deploy staging; ทุกทีมตรวจ evidence ก่อน production

## Definition of done ร่วม

- ทุกทีมทำตาม baseline เดียว ไม่เพิ่ม library ใหม่โดยไม่มีเหตุผลในเอกสาร
- contract และ enum อยู่ที่เดียว ไม่ copy เป็น string หลายจุด
- มี loading, empty, error, unauthorized และ success state
- mobile ผ่าน 320/375/414px และไม่มีข้อมูลสำคัญถูกตัด
- financial mutation ตรวจ server ซ้ำและมี audit
- staging ผ่าน typecheck, unit, browser E2E, accessibility และ hard-reload readback
