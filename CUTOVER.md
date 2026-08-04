# คู่มือย้ายระบบ (Cutover) — Laravel/Filament → Next.js + FastAPI

ระบบใหม่ (`febc-postal/`) และ Laravel เดิม (`post.febcthailand.com/public_html`) **ใช้ MySQL `febcthcom_dev24` ฐานเดียวกัน** — รันคู่กันได้ระหว่างทดสอบ (อ่านปลอดภัย) แต่ **ควรเขียนจากระบบเดียว** เพื่อกันรหัสนักเรียนชนกัน

## ✅ Feature parity (ทั้ง 8 requirement ทำครบในระบบใหม่)
1. Dashboard + filter วันที่ + กราฟ · 2. สมัครกลุ่ม (แม่ข่าย/ผู้ขับเคลื่อน) · 3. รหัสใหม่ `MM0001/2026` · 4. ช่องคะแนน 9 ช่อง · 5. ขนาดกระดาษ A5/A4/B5 · 6. ใบประกาศ+ลายเซ็น+30 ชม.นักโทษ · 7. ซองส่งกลับ · 8. คำพยาน

## ก่อน cutover
- [x] **หมุนรหัส DB** (2026-08-04): root/febc_api → สุ่ม hex ใหม่, `docker-compose.yml` อ่านจาก `.env` (gitignored). ⏳ ยังเหลือ Google/LINE OAuth secret ที่เคย commit ใน Laravel `.env`
- [ ] ตั้ง `JWT_SECRET` เป็นค่าสุ่มยาวใน `backend/.env` (prod)
- [ ] `COOKIE_SECURE=true` + เสิร์ฟผ่าน HTTPS (prod)
- [ ] `CORS_ORIGINS` + `NEXT_PUBLIC_API_URL` = โดเมนจริง
- [x] ลบ `root@'%'` แล้ว (เหลือ `root@localhost`). `febc_api@'%'` คงไว้ — ต่อผ่าน docker network + port bind `127.0.0.1` เท่านั้น
- [ ] คัดลอกไฟล์อัปโหลดเดิม (testimony, signatures) จาก Laravel `storage/app/public` → `backend/media/` ถ้าต้องการเก็บของเก่า
- [ ] Backfill: รหัสใบประกาศใช้ id 7/8/9 แล้ว (migration `consolidate_post_lessons_to_9` ทำใน DB แล้ว) — ระบบใหม่พึ่งพาสิ่งนี้

## ขั้นตอน cutover
1. Deploy `docker compose up -d --build` บน prod host (ต่อ MySQL prod)
2. รันคู่ Laravel (source of truth) — ใช้ระบบใหม่แบบ read-only ทดสอบ parity
3. เมื่อพร้อม: **ปิดการเขียนฝั่ง Laravel** (เอา staff ออกจาก /admin,/post หรือปิด Filament) เพื่อไม่ให้รหัสนักเรียนถูกสร้างจาก 2 ที่
4. สลับ DNS/reverse-proxy ให้ชี้ frontend ใหม่
5. ตั้ง cron: `docker compose exec -T backend python -m app.scripts.recompute_ages` (รายวัน) — อัปเดตอายุ (แทน job-per-render เดิม)

## RBAC (ยืนยันแล้ว)
ทุก API router มี `Depends(require_staff)` (staff หรือ is_admin) — ปิดช่องโหว่ `/post` เดิมที่ไม่มี gate. `/api/auth/login` เปิด + มี rate-limit (5 ครั้ง/10 นาที ต่อ ip+email). `/api/auth/me` ต้องมี cookie.

## Database prod (ตั้งบนเครื่องนี้ — โปรโมต UAT→prod, คงข้อมูล febcthcom_dev24)
- **Backup**: systemd timer `mysql-backup.timer` รันทุกวัน 01:30 ICT → `~/backups/mysql/*.sql.gz` (mysqldump --single-transaction, gzip ~37MB, retention 14 วัน). สคริปต์ `~/scripts/backup-mysql.sh`, creds `~/scripts/.mysql-backup.env` (chmod 600). สั่งเอง: `sudo systemctl start mysql-backup.service`
- **Offsite (GCS)**: โค้ดอัปโหลดพร้อมแล้ว (opt-in) — รอสิทธิ์ IAM `roles/storage.admin` ให้ SA `334471023365-compute@developer` แล้วสร้าง bucket + ใส่ `GCS_BUCKET=` ในไฟล์ creds
- **Tuning**: `innodb-buffer-pool-size=1G` (ตั้งใน compose `command:`; ฐาน 456MB แคชได้ทั้งหมด)

## หมายเหตุ prod
- Rate-limit login เป็น in-memory (single worker) — หลาย worker ให้ย้ายไป Redis
- Media (`/media`) เสิร์ฟผ่าน FastAPI StaticFiles — prod แนะนำ Nginx/S3
- ตาราง `post_*` ไม่มี Laravel migration (สร้างจาก SQL import) — schema prod ต้องตรง; migration ของเราที่ ALTER (testimony/group cols, post_default_values) รันแล้วใน dev DB, ต้องรันบน prod ด้วย
