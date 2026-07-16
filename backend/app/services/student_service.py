from datetime import date, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models.post_lesson import PostLesson, PostLessonPlan


def calc_age(birthday: date | None) -> str | None:
    """คำนวณอายุจากวันเกิด (คืนเป็น string ตาม schema เดิม varchar(3))"""
    if not birthday or birthday.year <= 1970:
        return None
    today = date.today()
    years = today.year - birthday.year - (
        (today.month, today.day) < (birthday.month, birthday.day)
    )
    # กัน birthday เสีย (อนาคต/ขยะ) — อายุต้องอยู่ในช่วงสมเหตุสมผล (คอลัมน์ varchar(3))
    if years < 0 or years > 120:
        return None
    return str(years)


def create_default_lesson_plans(db: Session, student_id: int) -> None:
    """สร้างแผนการเรียน 1 แถวต่อ PostLesson (ปัจจุบัน 9 บท) ให้นักเรียนใหม่"""
    now = datetime.now()
    lesson_ids = db.execute(select(PostLesson.id).order_by(PostLesson.id)).scalars().all()
    for lid in lesson_ids:
        db.add(
            PostLessonPlan(
                post_student_id=student_id,
                post_lesson_id=lid,
                created_at=now,
                updated_at=now,
            )
        )
