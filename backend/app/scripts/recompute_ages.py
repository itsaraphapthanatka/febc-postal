"""Recompute นักเรียนทุกคนที่มีวันเกิด → อัปเดต age ให้ตรงปัจจุบัน.

แทน anti-pattern เดิม (Laravel dispatch job ทุกครั้งที่โหลดตาราง).
รันเป็น cron รายวัน:  docker compose exec backend python -m app.scripts.recompute_ages
"""
from sqlalchemy import select

from ..db import SessionLocal
from ..models.post_student import PostStudent
from ..services.student_service import calc_age


def run() -> None:
    db = SessionLocal()
    try:
        updated = 0
        students = db.execute(
            select(PostStudent).where(PostStudent.birthday_date.isnot(None))
        ).scalars()
        for s in students:
            new_age = calc_age(s.birthday_date)
            if new_age and new_age != s.age:
                s.age = new_age
                updated += 1
        db.commit()
        print(f"recomputed age for {updated} students")
    finally:
        db.close()


if __name__ == "__main__":
    run()
