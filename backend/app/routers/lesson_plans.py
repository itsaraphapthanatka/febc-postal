from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from ..core.deps import require_staff
from ..db import get_db
from ..models.post_lesson import PostLesson, PostLessonPlan
from ..models.post_student import PostStudent
from ..schemas.common import Page
from ..schemas.plan import LessonPlanRow, PlanWithStudent, StudentPlanUpdate

router = APIRouter(
    prefix="/api",
    tags=["lesson-plans"],
    dependencies=[Depends(require_staff)],
)

# ── ช่วงบทเรียนใบประกาศ (หลัง #4 consolidate: cert = 7,8,9 ; graduate = 9) ──
CERT_MIN, CERT_MAX = 7, 9
GRADUATE_LESSON_ID = 9


def _joined_query():
    return (
        select(
            PostLessonPlan.id,
            PostLessonPlan.post_student_id,
            PostStudent.registration_number,
            PostStudent.first_name,
            PostStudent.last_name,
            PostLesson.title.label("lesson_title"),
            PostLessonPlan.sent_date,
            PostLessonPlan.received_date,
            PostLessonPlan.lesson_mark,
        )
        .join(PostStudent, PostStudent.id == PostLessonPlan.post_student_id)
        .join(PostLesson, PostLesson.id == PostLessonPlan.post_lesson_id, isouter=True)
    )


def _row_to_schema(r) -> PlanWithStudent:
    return PlanWithStudent(
        id=r.id,
        post_student_id=r.post_student_id,
        registration_number=r.registration_number,
        first_name=r.first_name,
        last_name=r.last_name,
        lesson_title=r.lesson_title,
        sent_date=r.sent_date,
        received_date=r.received_date,
        lesson_mark=r.lesson_mark,
    )


def _paginated(db, base, count_base, page, per_page):
    total = db.execute(count_base).scalar() or 0
    per_page = min(max(per_page, 1), 100)
    page = max(page, 1)
    rows = db.execute(
        base.order_by(PostLessonPlan.id.desc()).offset((page - 1) * per_page).limit(per_page)
    ).all()
    pages = (total + per_page - 1) // per_page if per_page else 1
    return Page(
        items=[_row_to_schema(r) for r in rows],
        total=total, page=page, per_page=per_page, pages=pages,
    )


# ── Delivery queue: บทเรียนที่ต้องจัดส่ง ──
@router.get("/lesson-plans", response_model=Page[PlanWithStudent])
def list_lesson_plans(
    db: Session = Depends(get_db),
    page: int = 1,
    per_page: int = 20,
    search: str | None = None,
    lesson_id: int | None = None,
):
    base = _joined_query()
    count_base = (
        select(func.count())
        .select_from(PostLessonPlan)
        .join(PostStudent, PostStudent.id == PostLessonPlan.post_student_id)
    )
    if search:
        like = f"%{search}%"
        cond = or_(
            PostStudent.registration_number.like(like),
            PostStudent.first_name.like(like),
            PostStudent.last_name.like(like),
        )
        base = base.where(cond)
        count_base = count_base.where(cond)
    if lesson_id:
        base = base.where(PostLessonPlan.post_lesson_id == lesson_id)
        count_base = count_base.where(PostLessonPlan.post_lesson_id == lesson_id)
    return _paginated(db, base, count_base, page, per_page)


# ── รายชื่อได้ใบประกาศ (lesson 7-9) ──
@router.get("/certificates", response_model=Page[PlanWithStudent])
def list_certificates(db: Session = Depends(get_db), page: int = 1, per_page: int = 20, search: str | None = None):
    base = _joined_query().where(PostLessonPlan.post_lesson_id.between(CERT_MIN, CERT_MAX))
    count_base = (
        select(func.count()).select_from(PostLessonPlan)
        .join(PostStudent, PostStudent.id == PostLessonPlan.post_student_id)
        .where(PostLessonPlan.post_lesson_id.between(CERT_MIN, CERT_MAX))
    )
    if search:
        like = f"%{search}%"
        cond = or_(PostStudent.registration_number.like(like), PostStudent.first_name.like(like), PostStudent.last_name.like(like))
        base = base.where(cond)
        count_base = count_base.where(cond)
    return _paginated(db, base, count_base, page, per_page)


# ── นักเรียนที่จบการศึกษา (lesson 9) ──
@router.get("/graduates", response_model=Page[PlanWithStudent])
def list_graduates(db: Session = Depends(get_db), page: int = 1, per_page: int = 20, search: str | None = None):
    base = _joined_query().where(PostLessonPlan.post_lesson_id == GRADUATE_LESSON_ID)
    count_base = (
        select(func.count()).select_from(PostLessonPlan)
        .join(PostStudent, PostStudent.id == PostLessonPlan.post_student_id)
        .where(PostLessonPlan.post_lesson_id == GRADUATE_LESSON_ID)
    )
    if search:
        like = f"%{search}%"
        cond = or_(PostStudent.registration_number.like(like), PostStudent.first_name.like(like), PostStudent.last_name.like(like))
        base = base.where(cond)
        count_base = count_base.where(cond)
    return _paginated(db, base, count_base, page, per_page)


# ── แผนการเรียนรายคน: อ่าน 9 ช่องของนักเรียน 1 คน ──
@router.get("/students/{sid}/lesson-plans", response_model=list[LessonPlanRow])
def student_lesson_plans(sid: int, db: Session = Depends(get_db)):
    rows = db.execute(
        select(
            PostLessonPlan.id,
            PostLessonPlan.post_lesson_id,
            PostLesson.title.label("lesson_title"),
            PostLessonPlan.sent_date,
            PostLessonPlan.received_date,
            PostLessonPlan.lesson_mark,
        )
        .join(PostLesson, PostLesson.id == PostLessonPlan.post_lesson_id, isouter=True)
        .where(PostLessonPlan.post_student_id == sid)
        .order_by(PostLessonPlan.post_lesson_id)
    ).all()
    return [
        LessonPlanRow(
            id=r.id, post_lesson_id=r.post_lesson_id, lesson_title=r.lesson_title,
            sent_date=r.sent_date, received_date=r.received_date, lesson_mark=r.lesson_mark,
        )
        for r in rows
    ]


# ── แผนการเรียนรายคน: บันทึกหลายช่องพร้อมกัน ──
@router.put("/students/{sid}/lesson-plans", response_model=list[LessonPlanRow])
def update_student_lesson_plans(sid: int, body: list[StudentPlanUpdate], db: Session = Depends(get_db)):
    now = datetime.now()
    for item in body:
        plan = db.get(PostLessonPlan, item.id)
        if not plan or plan.post_student_id != sid:
            continue
        plan.sent_date = item.sent_date
        plan.received_date = item.received_date
        plan.lesson_mark = item.lesson_mark
        plan.updated_at = now
    db.commit()
    return student_lesson_plans(sid, db)


# ── อัปเดตแผนเดียว (delivery queue inline) ──
@router.put("/lesson-plans/{pid}", response_model=PlanWithStudent)
def update_lesson_plan(pid: int, body: StudentPlanUpdate, db: Session = Depends(get_db)):
    plan = db.get(PostLessonPlan, pid)
    if not plan:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "ไม่พบแผนการเรียน")
    plan.sent_date = body.sent_date
    plan.received_date = body.received_date
    plan.lesson_mark = body.lesson_mark
    plan.updated_at = datetime.now()
    db.commit()
    row = db.execute(_joined_query().where(PostLessonPlan.id == pid)).first()
    return _row_to_schema(row)
