import os
import uuid
from datetime import date, datetime

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import and_, delete, func, or_, select
from sqlalchemy.orm import Session

from ..config import settings
from ..core.deps import require_staff
from ..db import get_db
from ..models.post_lesson import PostLessonPlan
from ..models.post_student import PostStudent
from ..schemas.common import Page
from ..schemas.student import StudentCreate, StudentOut, StudentUpdate
from ..services import registration_number as regsvc
from ..services.student_service import calc_age, create_default_lesson_plans

router = APIRouter(
    prefix="/api/students",
    tags=["students"],
    dependencies=[Depends(require_staff)],
)

FUNNEL_CONDS = {
    "confession": lambda: PostStudent.confession_date.isnot(None),
    "baptism": lambda: PostStudent.baptism_date.isnot(None),
    "gotochurch": lambda: PostStudent.send_to_church_date.isnot(None),
    "serving": lambda: and_(PostStudent.serving.isnot(None), PostStudent.serving != ""),
}


@router.get("/next-code")
def next_code(type: str = "individual", db: Session = Depends(get_db)):
    if type == "network":
        return {"registration_number": regsvc.next_network(db, date.today())}
    return {"registration_number": regsvc.next_individual(db)}


@router.get("", response_model=Page[StudentOut])
def list_students(
    db: Session = Depends(get_db),
    page: int = 1,
    per_page: int = 20,
    search: str | None = None,
    province: str | None = None,
    funnel: str | None = None,
):
    conds = []
    if search:
        like = f"%{search}%"
        conds.append(
            or_(
                PostStudent.registration_number.like(like),
                PostStudent.first_name.like(like),
                PostStudent.last_name.like(like),
                PostStudent.phone_number.like(like),
            )
        )
    if province:
        conds.append(PostStudent.province == province)
    if funnel in FUNNEL_CONDS:
        conds.append(FUNNEL_CONDS[funnel]())

    base = select(PostStudent)
    count_q = select(func.count()).select_from(PostStudent)
    for c in conds:
        base = base.where(c)
        count_q = count_q.where(c)

    total = db.execute(count_q).scalar() or 0
    per_page = min(max(per_page, 1), 100)
    page = max(page, 1)
    rows = db.execute(
        base.order_by(PostStudent.id.desc()).offset((page - 1) * per_page).limit(per_page)
    ).scalars().all()
    pages = (total + per_page - 1) // per_page if per_page else 1
    return Page(items=rows, total=total, page=page, per_page=per_page, pages=pages)


@router.get("/{sid}", response_model=StudentOut)
def get_student(sid: int, db: Session = Depends(get_db)):
    s = db.get(PostStudent, sid)
    if not s:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "ไม่พบนักเรียน")
    return s


@router.post("", response_model=StudentOut, status_code=status.HTTP_201_CREATED)
def create_student(body: StudentCreate, db: Session = Depends(get_db)):
    now = datetime.now()
    data = body.model_dump()
    reg = data.pop("registration_number", None) or regsvc.next_individual(db)
    if not data.get("age") and data.get("birthday_date"):
        data["age"] = calc_age(data["birthday_date"])
    student = PostStudent(registration_number=reg, created_at=now, updated_at=now, **data)
    db.add(student)
    db.flush()
    create_default_lesson_plans(db, student.id)
    db.commit()
    db.refresh(student)
    return student


@router.put("/{sid}", response_model=StudentOut)
def update_student(sid: int, body: StudentUpdate, db: Session = Depends(get_db)):
    student = db.get(PostStudent, sid)
    if not student:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "ไม่พบนักเรียน")
    data = body.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(student, k, v)
    if data.get("birthday_date"):
        student.age = calc_age(data["birthday_date"])
    student.updated_at = datetime.now()
    db.commit()
    db.refresh(student)
    return student


@router.delete("/{sid}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(sid: int, db: Session = Depends(get_db)):
    student = db.get(PostStudent, sid)
    if student:
        db.execute(delete(PostLessonPlan).where(PostLessonPlan.post_student_id == sid))
        db.delete(student)
        db.commit()
    return None


@router.post("/{sid}/testimony", response_model=StudentOut)
async def upload_testimony(
    sid: int, file: UploadFile = File(...), db: Session = Depends(get_db)
):
    student = db.get(PostStudent, sid)
    if not student:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "ไม่พบนักเรียน")
    ext = os.path.splitext(file.filename or "")[1].lower()
    fname = f"{uuid.uuid4().hex}{ext}"
    dest_dir = os.path.join(settings.MEDIA_DIR, "testimonies")
    os.makedirs(dest_dir, exist_ok=True)
    with open(os.path.join(dest_dir, fname), "wb") as fh:
        fh.write(await file.read())
    student.testimony_file = f"testimonies/{fname}"
    student.has_testimony = True
    student.updated_at = datetime.now()
    db.commit()
    db.refresh(student)
    return student
