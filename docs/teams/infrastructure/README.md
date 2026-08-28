# PEMA — Infrastructure Team Guide

ทีมรับผิดชอบ: runtime, environment, database operation, storage, auth integration, deploy และ monitoring  
อ้างอิง: [team delivery map](../README.md), [Material 3 design spec](../../pema-material3-design-spec.md)

## 1. Scope

รับผิดชอบ:

- หนึ่ง Next.js app, หนึ่ง deploy pipeline และ environment separation
- PostgreSQL, Prisma migration, backup และ restore
- private object storage สำหรับไฟล์แนบ
- auth provider/SSO configuration และ secret management
- health check, logs, error tracking และ production readback
- CI/CD ขั้นต่ำที่ป้องกัน migration/secret ผิดพลาด

ไม่รับผิดชอบ:

- business rule, approval logic และ UI component
- การ bypass authorization เพื่อให้ deploy ผ่าน
- การเพิ่ม service ใหม่โดยไม่มี requirement และ owner

## 2. MVP topology

```text
User
  -> HTTPS
  -> Next.js app (web + Server Actions + Route Handlers)
       -> PostgreSQL + Prisma
       -> Private object storage
       -> KKU SSO/auth provider
```

ไม่ต้องมีใน MVP: Kubernetes, microservices, API gateway, message broker, realtime server, worker cluster และ analytics warehouse

### Runtime ที่ deploy จริงในรอบแรก

- container ภายในฟังที่ `3000`
- server bind ที่ `APP_PORT` โดยค่าเริ่มต้นคือ `3061`
- จากการตรวจ server วันที่ 28 สิงหาคม 2569 พบว่า `3061` ยังว่าง แต่ deployment script จะตรวจ `ss` ซ้ำทุกครั้งและหยุดถ้าพอร์ตถูกใช้โดย service อื่น
- ใช้ container/project name `pema-kku-app` และ `pema-kku` เพื่อแยกจาก compose อื่น
- ไม่เปิด database port เพิ่ม แอปใช้ค่า `DB_*` เดิมจาก `.env` และ compose URL ตอน container start

## 3. Environments

| Environment | ใช้สำหรับ | ข้อกำหนด |
|---|---|---|
| Local | development | ใช้ seed data ปลอมและ `.env.local` ที่ไม่ commit |
| Staging | integration/E2E/UAT | data แยก, domain แยก, ใช้ auth test account |
| Production | งานจริง | backup, monitoring, approval ก่อน migration/deploy |

ห้ามใช้ข้อมูลผู้ใช้จริงใน local/staging โดยไม่มีการอนุมัติและการปกปิดข้อมูล

## 4. Configuration และ secrets

เก็บเฉพาะชื่อ variable ในเอกสาร/CI:

```text
DATABASE_URL
AUTH_ISSUER / AUTH_CLIENT_ID / AUTH_CLIENT_SECRET
STORAGE_ENDPOINT / STORAGE_BUCKET / STORAGE_ACCESS_KEY
APP_BASE_URL
ERROR_TRACKING_DSN
```

กฎ:

- secret อยู่ใน secret manager หรือ platform environment ไม่อยู่ใน git
- แยก secret ต่อ environment
- rotate ได้และ log ต้องไม่แสดงค่า secret/cookie/token
- production deploy ต้องตรวจว่าตัวแปรจำเป็นครบก่อน start

## 5. Database และ storage operation

- migration รันแบบ versioned และ review ก่อน production
- mock fixture ต้องเข้า database ผ่าน Prisma seeder ไม่ใช่ hard-code ใน runtime UI
- `npm run db:seed` ใช้ `.env` ชุดเดียวกับ migration, ทำงานแบบ idempotent และใช้คีย์ข้อมูล seed ที่ระบุชัดเจน (`SEED-*`, `seed-*` และ request number ของ fixture)
- ห้ามรัน seeder กับ production database เว้นแต่มีแผนข้อมูลทดสอบและ approval ชัดเจน
- backup PostgreSQL ตามรอบที่กำหนด พร้อมทดสอบ restore เป็นระยะ
- schema change ที่ทำลายข้อมูลต้องมี expand → migrate → contract plan
- private attachment storage บังคับ size/type policy และ signed URL
- ลบ/retention ไฟล์ต้องอิง policy ของเจ้าของข้อมูลและ audit
- health check ตรวจ app, database connection และ storage configuration โดยไม่เปิดเผยข้อมูล

## 6. CI/CD แบบเล็ก

Pipeline ขั้นต่ำ:

1. install จาก lockfile
2. typecheck/lint/unit test
3. build Next.js
4. browser E2E/a11y ใน staging หรือ preview
5. deploy app
6. run migration ที่ได้รับ approval
7. health check และ authenticated UI readback

ไม่ทำ auto-deploy production เมื่อ migration กระทบยอดเงิน/สิทธิ์โดยไม่มี human approval

### คำสั่งตรวจสอบ/รัน deploy แบบ local compatibility

```bash
npm install
npm run db:validate
npm run typecheck
npm run lint
npm test
npm run build
npm run deploy:server
```

`deploy:server` อ่าน host/user/remotePath จาก `.vscode/sftp.json`, ไม่ส่ง `.env` ขึ้น archive, อัปโหลด source archive ผ่าน SFTP, build/restart ด้วย Docker Compose และตรวจ `GET /pema/api/health` หลัง deploy

### GitHub Actions เป็นช่องทาง deploy หลัก

Workflow `.github/workflows/ci.yml` ทำงานตามลำดับ `quality → deploy` โดย deploy จะทำงานเมื่อ push เข้า `main` หรือเมื่อกด `workflow_dispatch` พร้อมเลือก `confirm=true` เท่านั้น การ deploy ใช้ GitHub Environment ชื่อ `production` และมี concurrency lock ชื่อ `pema-production` เพื่อไม่ให้ deploy ชนกัน

ต้องตั้งค่าใน GitHub ที่ `Settings → Environments → production`:

| ประเภท | ชื่อ | ค่า |
|---|---|---|
| Secret | `PEMA_SSH_PRIVATE_KEY` | private key สำหรับ user deploy บน server |
| Secret | `PEMA_KNOWN_HOSTS` | บรรทัด host key ที่ยืนยันแล้วของ server |
| Secret | `PEMA_DEPLOY_HOST` | hostname/IP ของ server |
| Secret | `PEMA_DEPLOY_USER` | user สำหรับ SSH/SFTP |
| Secret | `PEMA_DEPLOY_PATH` | absolute path ของ app บน server |
| Secret | `PEMA_PRODUCTION_ENV` | เนื้อหา `.env` production ทั้งชุด รวม `AUTH_MODE=jwt` และ `AUTH_JWT_SECRET` |
| Variable | `PEMA_DEPLOY_PORT` | SSH port; ถ้าไม่ตั้งใช้ `22` |
| Variable | `PEMA_APP_PORT` | host port ของ app; ถ้าไม่ตั้งใช้ `3061` |

`PEMA_PRODUCTION_ENV` ถูกเขียนลง runner ชั่วคราวและส่งขึ้น server แยกจาก source archive ไม่ถูก commit และไม่ถูกแสดงใน log การ deploy จะหยุดก่อน upload หากไม่มี `AUTH_JWT_SECRET` หรือกำหนด `AUTH_MODE` เป็นค่าอื่นนอกจาก `jwt`

การ seed ไม่ถูกรันอัตโนมัติใน production workflow เพื่อป้องกันข้อมูลทดสอบปะปนกับข้อมูลจริง ใช้ `npm run db:seed` กับ database ที่แยกแล้วเท่านั้น

## Reverse proxy

เพิ่มบล็อกใน server block ของ `lib.kku.ac.th` จากไฟล์ `deploy/nginx/pema-location.conf` แล้วทดสอบด้วย `nginx -t` ก่อน reload container `lib-nginx-1` การ forward ต้องคง prefix `/pema` ไว้ เพราะ Next.js build ด้วย `basePath=/pema` และ upstream ใช้ port `3061` ซึ่งแยกจาก service เดิม

## 7. Observability แบบพอดี

เริ่มด้วย:

- structured application log
- error tracking
- audit table จาก Backend
- uptime/health check
- deploy revision และ migration version

log context ที่ควรมี: request id, route/action, user/role แบบไม่เปิดเผยเกินจำเป็น, status, duration และ error code

แยก audit ออกจาก application log และไม่ส่งข้อมูลการเงิน/PII ทั้งก้อนไป analytics

## 8. Security baseline

- HTTPS และ secure session cookie
- database/network ไม่เปิด public เกินจำเป็น
- least-privilege access แยก app/CI/operator
- upload storage private และไม่ serve ไฟล์จาก path ที่เดาได้
- rate limit/size limit สำหรับ upload และ mutation ที่เสี่ยง
- migration/backup access มี audit
- ตรวจ dependency และ secret scanning ใน CI

## 9. Handoff และ acceptance

ส่งให้ Frontend:

- staging URL, test account flow และ route ที่ต้องตรวจ
- viewport/evidence checklist
- known environment limitation

ส่งให้ Backend:

- database URL name, migration procedure และ connection policy
- storage bucket/policy name
- auth claims/role mapping ที่ใช้งานได้
- log/health check location

ผ่านเมื่อ:

- staging deploy ได้จาก lockfile และ health check ผ่าน
- migration/rollback หรือ restore procedure ผ่านการทบทวน
- authenticated dashboard/list/detail อ่านได้หลัง hard reload
- ไม่มี secret หรือข้อมูลส่วนตัวรั่วใน log/CI artifact
- production deploy แยกสถานะ app, migration, health และ UI readback ชัดเจน
