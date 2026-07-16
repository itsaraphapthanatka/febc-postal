import json
import os
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..config import settings as app_settings
from ..core.deps import require_staff
from ..db import get_db
from ..models.post_default_value import PostDefaultValue
from ..models.post_lesson import PostLesson, PostLessonPlan, PostPrintHistory
from ..models.post_student import PostStudent
from ..schemas.print import (
    PrintData,
    PrintEvent,
    PrintPlan,
    PrintStudent,
    Signatures,
)

router = APIRouter(prefix="/api", tags=["print"], dependencies=[Depends(require_staff)])

SIG_DIR = "director_signature"
SIG_HEAD = "section_head_signature"
LAYOUT_KEY = "certificate_layout"

# ตำแหน่ง overlay บนใบประกาศ (หน่วย % ของ top/left, จุดกึ่งกลาง element)
DEFAULT_CERT_LAYOUT = {
    "name": {"top": 44, "left": 50},
    "date": {"top": 68, "left": 50},
    "hours": {"top": 73, "left": 50},
    "section_head": {"top": 78, "left": 30},
    "director": {"top": 78, "left": 70},
}


def _signatures(db: Session) -> Signatures:
    rows = db.execute(
        select(PostDefaultValue).where(PostDefaultValue.key.in_([SIG_DIR, SIG_HEAD]))
    ).scalars().all()
    m = {r.key: r.value for r in rows}
    return Signatures(director=m.get(SIG_DIR), section_head=m.get(SIG_HEAD))


def _student_schema(s: PostStudent) -> PrintStudent:
    return PrintStudent(
        id=s.id,
        registration_number=s.registration_number,
        first_name=s.first_name,
        last_name=s.last_name,
        address=s.address,
        tambon=s.tambon,
        amphure=s.amphure,
        province=s.province,
        zipcode=s.zipcode,
        profession=s.profession,
    )


@router.get("/print/plan/{pid}", response_model=PrintData)
def print_plan(pid: int, db: Session = Depends(get_db)):
    plan = db.get(PostLessonPlan, pid)
    if not plan:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "ไม่พบแผนการเรียน")
    student = db.get(PostStudent, plan.post_student_id)
    if not student:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "ไม่พบนักเรียน")
    title = db.execute(
        select(PostLesson.title).where(PostLesson.id == plan.post_lesson_id)
    ).scalar()
    return PrintData(
        plan=PrintPlan(
            id=plan.id,
            post_lesson_id=plan.post_lesson_id,
            lesson_title=title,
            sent_date=plan.sent_date,
            received_date=plan.received_date,
            lesson_mark=plan.lesson_mark,
        ),
        student=_student_schema(student),
        signatures=_signatures(db),
    )


@router.get("/print/student/{sid}", response_model=PrintData)
def print_student(sid: int, db: Session = Depends(get_db)):
    student = db.get(PostStudent, sid)
    if not student:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "ไม่พบนักเรียน")
    return PrintData(plan=None, student=_student_schema(student), signatures=_signatures(db))


@router.post("/print-events")
def print_event(body: PrintEvent, db: Session = Depends(get_db)):
    plan = db.get(PostLessonPlan, body.post_lesson_plan_id)
    if not plan:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "ไม่พบแผนการเรียน")
    now = datetime.now()
    if body.stamp_sent:
        plan.sent_date = now
        plan.updated_at = now
    db.add(
        PostPrintHistory(
            post_lesson_plan_id=plan.id,
            go_or_back=body.go_or_back,
            created_at=now,
            updated_at=now,
        )
    )
    db.commit()
    return {"status": "ok"}


# ── Certificate signature settings (mirror Laravel CertificateSettings) ──
@router.get("/settings/certificate", response_model=Signatures)
def get_certificate_settings(db: Session = Depends(get_db)):
    return _signatures(db)


@router.get("/settings/certificate-layout")
def get_certificate_layout(db: Session = Depends(get_db)):
    row = db.execute(
        select(PostDefaultValue).where(PostDefaultValue.key == LAYOUT_KEY)
    ).scalar_one_or_none()
    if row and row.value:
        try:
            saved = json.loads(row.value)
            return {**DEFAULT_CERT_LAYOUT, **saved}
        except (ValueError, TypeError):
            pass
    return DEFAULT_CERT_LAYOUT


@router.put("/settings/certificate-layout")
def save_certificate_layout(layout: dict, db: Session = Depends(get_db)):
    value = json.dumps(layout, ensure_ascii=False)
    row = db.execute(
        select(PostDefaultValue).where(PostDefaultValue.key == LAYOUT_KEY)
    ).scalar_one_or_none()
    if row:
        row.value = value
    else:
        db.add(PostDefaultValue(key=LAYOUT_KEY, value=value))
    db.commit()
    return {"status": "ok", "layout": layout}


@router.post("/settings/certificate/signature", response_model=Signatures)
async def upload_signature(
    which: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    key = SIG_DIR if which == "director" else SIG_HEAD
    ext = os.path.splitext(file.filename or "")[1].lower() or ".png"
    fname = f"{uuid.uuid4().hex}{ext}"
    dest_dir = os.path.join(app_settings.MEDIA_DIR, "signatures")
    os.makedirs(dest_dir, exist_ok=True)
    with open(os.path.join(dest_dir, fname), "wb") as fh:
        fh.write(await file.read())
    path = f"signatures/{fname}"
    row = db.execute(
        select(PostDefaultValue).where(PostDefaultValue.key == key)
    ).scalar_one_or_none()
    if row:
        row.value = path
    else:
        db.add(PostDefaultValue(key=key, value=path))
    db.commit()
    return _signatures(db)
