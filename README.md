# PEMA KKU backend

Backend MVP สำหรับระบบหลักการขอใช้งบประมาณและการเบิกจ่ายของ PEMA KKU ใช้ Next.js Route Handlers, PostgreSQL และ Prisma ใน app เดียว เพื่อให้ deploy ได้เร็วและดูแลน้อย

## Quick start

```bash
npm install
cp .env.example .env
npm run db:validate
npm run db:seed
npm run typecheck
npm run lint
npm test
npm run build
```

ไฟล์ `.env` รองรับทั้ง `DATABASE_URL` หรือชุด `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` โดยไม่ commit secret ลง repository

`npm run db:seed` จะนำ mock fixture ของระบบเข้า PostgreSQL จริง ได้แก่ 5 คำขอ, รายการค่าใช้จ่าย, วิทยากร, เอกสารแนบ, approval timeline และรายการเบิกจ่าย โดยใช้คีย์ `SEED-*`/request number เดิมเพื่อให้รันซ้ำได้โดยไม่สร้างข้อมูลซ้ำ ควรใช้กับ local หรือ database ที่แยกจาก production เท่านั้น

## API

- `GET /pema/api/health` ตรวจ app และ database
- `GET/POST /pema/api/requests` รายการและสร้าง draft
- `GET/PATCH /pema/api/requests/:id` อ่านและแก้ draft/returned
- `POST /pema/api/requests/:id/submit` ส่งเข้า workflow
- `POST /pema/api/requests/:id/review` approve/return ตาม role
- `POST /pema/api/requests/:id/disbursements` สร้าง draft เบิกจ่ายจากคำขอที่อนุมัติแล้ว

Production ต้องตั้ง `AUTH_MODE=jwt` และ `AUTH_JWT_SECRET` ก่อนเรียก API ธุรกรรม ระบบจะไม่รับ dev headers เมื่อ `APP_ENV=production`

## Docker และ deploy

container ฟังที่ `3000` และ server bind ที่ `APP_PORT` ซึ่ง default เป็น `3061` โดย GitHub Actions เป็นช่องทาง deploy หลัก: quality checks ต้องผ่านก่อน แล้วจึง upload source archive และ production environment ผ่าน SSH, ตรวจ port, build/restart Docker Compose, migrate database และรอ `/pema/api/health`

```bash
npm run deploy:server
```

คำสั่งด้านบนยังใช้ deploy จากเครื่องพัฒนาได้เมื่อจำเป็น ส่วนขั้นตอนหลักให้ merge เข้า `main` หรือกด `workflow_dispatch` พร้อมยืนยันใน GitHub Actions รายละเอียด Secrets อยู่ที่ [Infrastructure Guide](docs/teams/infrastructure/README.md)

รายละเอียดการแบ่งงานอยู่ที่ [docs/teams/README.md](docs/teams/README.md) และ architectural decision อยู่ที่ [ADR-001](docs/decisions/ADR-001-fast-lane-backend-infrastructure.md)
