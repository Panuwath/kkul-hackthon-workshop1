# ADR-001: Fast-lane backend และ infrastructure สำหรับ PEMA KKU

## Status

Accepted

## Date

2026-08-28

## Context

ต้องเริ่มพัฒนา backend และ deploy บน server ที่มี Docker/Compose อยู่แล้ว โดยต้องไม่ชน port กับ application อื่น และต้องใช้ `.env` เดิมที่แยก `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` แทนการเพิ่ม secret ซ้ำ

## Decision

- ใช้ Next.js App Router แบบ modular monolith เดียว
- ใช้ PostgreSQL + Prisma migration ที่ versioned
- ใช้ REST Route Handlers เป็น public backend contract ระยะแรก
- ใช้ Zod validate ที่ boundary และ server เป็น source of truth ของยอดเงิน
- ใช้ transaction + optimistic concurrency (`version`) กับการแก้ไข/submit/review
- build เป็น standalone Docker image และให้ container ฟังที่ `3000`
- bind server port ที่ `3061` เป็นค่าเริ่มต้น พร้อม preflight ตรวจซ้ำก่อน `docker compose up`
- production ใช้ `AUTH_MODE=jwt`; dev header auth เปิดได้เฉพาะ environment ที่ไม่ใช่ production
- deploy หลักผ่าน GitHub Actions job ที่เรียก `scripts/deploy-server.sh` ด้วย GitHub Environment/Secrets และไม่ส่ง `.env` เข้า source archive; `scripts/deploy-server.sh` ยังรองรับ `.vscode/sftp.json` สำหรับ local compatibility

## Alternatives considered

### Microservices / API gateway

ปฏิเสธใน MVP เพราะเพิ่ม network boundary, deploy unit และ operational cost โดยยังไม่มี requirement รองรับ

### เปิด port ใหม่แบบเลือกจากความเคยชิน

ปฏิเสธ เพราะ server มีหลาย service อยู่แล้ว จึงเลือก port หลังตรวจ `ss` และเก็บ preflight ไว้ใน script เพื่อกันการชนใน deploy ครั้งถัดไป

### ใช้ `db push` แทน migration

ปฏิเสธ เพราะ schema ของ workflow และยอดเงินต้องตรวจย้อนกลับได้ จึงใช้ `prisma migrate deploy`

## Consequences

ข้อดีคือเริ่มระบบได้เร็ว มีขอบเขต API/DB/Runtime ชัด และ rollback container ได้ง่ายขึ้น ข้อจำกัดที่ยอมรับในรอบนี้คือยังไม่มี KKU SSO adapter จริง, ยังไม่มี object-storage upload endpoint และยังไม่มี disbursement approval chain เต็มรูปแบบ ซึ่งต้องทำเป็นงานถัดไปก่อนใช้งาน production จริง
