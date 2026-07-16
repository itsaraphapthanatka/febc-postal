from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..core.deps import require_staff
from ..db import get_db
from ..models.post_group import PostDriver, PostGroup, PostTeacher
from ..models.post_student import PostStudent
from ..schemas.group import (
    DriverCreate,
    DriverOut,
    GroupCreate,
    GroupOut,
    TeacherCreate,
    TeacherOut,
)
from ..services import registration_number as regsvc
from ..services.student_service import create_default_lesson_plans

router = APIRouter(prefix="/api", tags=["groups"], dependencies=[Depends(require_staff)])


# ── Teachers ──
@router.get("/teachers", response_model=list[TeacherOut])
def list_teachers(db: Session = Depends(get_db)):
    return db.execute(select(PostTeacher).order_by(PostTeacher.first_name)).scalars().all()


@router.post("/teachers", response_model=TeacherOut, status_code=status.HTTP_201_CREATED)
def create_teacher(body: TeacherCreate, db: Session = Depends(get_db)):
    now = datetime.now()
    t = PostTeacher(**body.model_dump(), created_at=now, updated_at=now)
    db.add(t)
    db.commit()
    db.refresh(t)
    return t


# ── Drivers ──
@router.get("/drivers", response_model=list[DriverOut])
def list_drivers(db: Session = Depends(get_db)):
    return db.execute(select(PostDriver).order_by(PostDriver.name)).scalars().all()


@router.post("/drivers", response_model=DriverOut, status_code=status.HTTP_201_CREATED)
def create_driver(body: DriverCreate, db: Session = Depends(get_db)):
    now = datetime.now()
    d = PostDriver(**body.model_dump(), created_at=now, updated_at=now)
    db.add(d)
    db.commit()
    db.refresh(d)
    return d


# ── Groups ──
@router.get("/groups")
def list_groups(db: Session = Depends(get_db)):
    rows = db.execute(select(PostGroup).order_by(PostGroup.id.desc())).scalars().all()
    result = []
    for g in rows:
        teacher = db.get(PostTeacher, g.post_teacher_id) if g.post_teacher_id else None
        driver = db.get(PostDriver, g.post_driver_id) if g.post_driver_id else None
        count = db.execute(
            select(func.count()).select_from(PostStudent).where(PostStudent.post_group_id == g.id)
        ).scalar() or 0
        result.append({
            "id": g.id,
            "type": g.type,
            "teacher_name": f"{teacher.first_name} {teacher.last_name or ''}".strip() if teacher else None,
            "driver_name": driver.name if driver else None,
            "church_name": g.church_name,
            "registration_date": g.registration_date.isoformat() if g.registration_date else None,
            "students_count": count,
        })
    return result


@router.post("/groups", response_model=GroupOut, status_code=status.HTTP_201_CREATED)
def create_group(body: GroupCreate, db: Session = Depends(get_db)):
    teacher = db.get(PostTeacher, body.post_teacher_id)
    if not teacher:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "ไม่พบครูผู้สอน")

    reg_date = body.registration_date or date.today()
    now = datetime.now()

    group = PostGroup(
        type=body.type,
        post_driver_id=body.post_driver_id if body.type == "driver" else None,
        post_teacher_id=body.post_teacher_id,
        church_name=body.church_name,
        registration_date=reg_date,
        created_at=now,
        updated_at=now,
    )
    db.add(group)
    db.flush()

    for s in body.students:
        if not s.first_name:
            continue
        code = (
            regsvc.next_network(db, reg_date)
            if body.type == "network"
            else regsvc.next_individual(db)
        )
        student = PostStudent(
            registration_number=code,
            registration_date=reg_date,
            first_name=s.first_name,
            last_name=s.last_name or "",
            gender=s.gender or "ไม่ระบุ",
            profession="ไม่ระบุ",
            phone_number=s.phone_number,
            address=teacher.address,
            tambon=teacher.tambon,
            amphure=teacher.amphure,
            province=teacher.province,
            zipcode=teacher.zipcode,
            church_name=body.church_name,
            post_group_id=group.id,
            post_teacher_id=teacher.id,
            created_at=now,
            updated_at=now,
        )
        db.add(student)
        db.flush()
        create_default_lesson_plans(db, student.id)

    db.commit()
    db.refresh(group)
    return group
