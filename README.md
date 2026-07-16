# FEBC Postal Admin — Next.js + FastAPI

Rewrite of the FEBC Thailand **postal correspondence** admin (เดิม Laravel 10 + Filament 3) เป็น:

- **Frontend:** Next.js 15 · React 19 · Tailwind v4 · lucide-react · recharts — ใช้ **Aunjai Admin Design System** (FEBC blue `#005696`)
- **Backend:** FastAPI · SQLAlchemy 2.0 · Pydantic v2 · JWT (httpOnly cookie)
- **DB:** MySQL `febcthcom_dev24` เดิม (ไม่ย้ายข้อมูล)

## Quick start (local)

Prereq: Docker Desktop + MySQL80 service รันอยู่ (ฐาน `febcthcom_dev24`).

```bash
cp backend/.env.example backend/.env      # แก้ค่าตามเครื่อง
cp frontend/.env.example frontend/.env.local
docker compose up --build
```

- Backend API:  http://localhost:8001  (docs: http://localhost:8001/docs)
- Frontend:     http://localhost:3000

Backend ต่อ MySQL ของ host ผ่าน `host.docker.internal:3306`.

## Dev login
`admin@test.com` / `admin1234` (staff, ใช้ hash เดิมจาก DB)

## โครงสร้าง
- `backend/`  — FastAPI (app/config, db, models, schemas, routers, services, core)
- `frontend/` — Next.js App Router (app/, components/{ui,charts,layout}, lib/)

ดูแผนเต็มที่ `~/.claude/plans/plan-silly-wreath.md`.
