from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..core.deps import require_staff
from ..db import get_db
from ..models.lookup import Religion
from ..models.post_lesson import PostLessonPlan
from ..models.post_student import PostStudent

router = APIRouter(
    prefix="/api/dashboard",
    tags=["dashboard"],
    dependencies=[Depends(require_staff)],
)


def _range(start: str | None, end: str | None) -> tuple[date, date]:
    today = date.today()
    s = date.fromisoformat(start) if start else date(today.year, 1, 1)
    e = date.fromisoformat(end) if end else date(today.year, 12, 31)
    return s, e


@router.get("/stats")
def stats(start: str | None = None, end: str | None = None, db: Session = Depends(get_db)):
    s, e = _range(start, end)

    def cnt(model, col, *extra):
        q = select(func.count()).select_from(model).where(col.between(s, e))
        for x in extra:
            q = q.where(x)
        return db.execute(q).scalar() or 0

    return {
        "new_students": cnt(PostStudent, PostStudent.registration_date),
        "confession": cnt(PostStudent, PostStudent.confession_date),
        "baptism": cnt(PostStudent, PostStudent.baptism_date),
        "plans_created": cnt(
            PostLessonPlan,
            PostLessonPlan.created_at,
            PostLessonPlan.sent_date.is_(None),
            PostLessonPlan.received_date.is_(None),
        ),
        "plans_sent": cnt(PostLessonPlan, PostLessonPlan.sent_date),
        "plans_completed": cnt(PostLessonPlan, PostLessonPlan.received_date),
        "cert1": cnt(PostLessonPlan, PostLessonPlan.sent_date, PostLessonPlan.post_lesson_id == 7),
        "cert2": cnt(PostLessonPlan, PostLessonPlan.sent_date, PostLessonPlan.post_lesson_id == 8),
        "cert3": cnt(PostLessonPlan, PostLessonPlan.sent_date, PostLessonPlan.post_lesson_id == 9),
    }


@router.get("/charts")
def charts(start: str | None = None, end: str | None = None, db: Session = Depends(get_db)):
    s, e = _range(start, end)

    def monthly(col) -> dict[str, int]:
        rows = db.execute(
            select(func.date_format(col, "%Y-%m").label("m"), func.count().label("c"))
            .where(col.between(s, e))
            .group_by("m")
        ).all()
        return {r.m: r.c for r in rows}

    new_m = monthly(PostStudent.registration_date)
    gotochurch_m = monthly(PostStudent.send_to_church_date)
    confession_m = monthly(PostStudent.confession_date)
    baptism_m = monthly(PostStudent.baptism_date)
    months = sorted(set(new_m) | set(gotochurch_m) | set(confession_m) | set(baptism_m))
    student_monthly = [
        {
            "month": m,
            "new": new_m.get(m, 0),
            "gotochurch": gotochurch_m.get(m, 0),
            "confession": confession_m.get(m, 0),
            "baptism": baptism_m.get(m, 0),
        }
        for m in months
    ]

    # province pie (top 10 + others), filtered by registration date range
    prov_rows = db.execute(
        select(PostStudent.province, func.count())
        .where(PostStudent.registration_date.between(s, e))
        .group_by(PostStudent.province)
        .order_by(func.count().desc())
    ).all()
    by_province = [{"label": r[0] or "ไม่ระบุ", "count": r[1]} for r in prov_rows[:10]]
    other = sum(r[1] for r in prov_rows[10:])
    if other:
        by_province.append({"label": "อื่นๆ", "count": other})

    # religion doughnut (map short_name → name)
    rel_map = {r.short_name: r.name for r in db.execute(select(Religion.short_name, Religion.name)).all()}
    rel_rows = db.execute(
        select(PostStudent.religion, func.count())
        .where(PostStudent.registration_date.between(s, e))
        .group_by(PostStudent.religion)
        .order_by(func.count().desc())
    ).all()
    by_religion = [
        {"label": rel_map.get(r[0], r[0]) or "ไม่ระบุ", "count": r[1]} for r in rel_rows[:8]
    ]
    rel_other = sum(r[1] for r in rel_rows[8:])
    if rel_other:
        by_religion.append({"label": "อื่นๆ", "count": rel_other})

    return {
        "student_monthly": student_monthly,
        "by_province": by_province,
        "by_religion": by_religion,
    }
