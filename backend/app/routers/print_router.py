import json
import os
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..config import settings as app_settings
from ..core.deps import require_admin, require_staff
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

# ตำแหน่ง overlay บนใบประกาศ (top/left = % ของใบ, จุดกึ่งกลาง element)
# size = px บนใบจริง (A4 แนวนอน กว้าง 29.7cm ≈ 1123px ที่ 96dpi)
#   ข้อความ → font-size · ลายเซ็น → ความสูงรูป (49px ≈ 1.3cm เท่าเดิม)
CERT_ITEM_KEYS = ("name", "date", "hours", "section_head", "director")

DEFAULT_CERT_LAYOUT = {
    "name": {"top": 44, "left": 50, "size": 48},
    "date": {"top": 68, "left": 50, "size": 24},
    "hours": {"top": 73, "left": 50, "size": 20},
    "section_head": {"top": 78, "left": 30, "size": 49},
    "director": {"top": 78, "left": 70, "size": 49},
    "font": "Sarabun",
}

# ต้องตรงกับ CERT_FONTS ใน frontend/lib/print.ts และ @import ใน CertStyle
# whitelist เท่านั้น — ห้ามให้ชื่อฟอนต์อิสระหลุดไปอยู่ใน CSS ของหน้าพิมพ์
CERT_FONTS = ("Sarabun", "Prompt", "Kanit", "Noto Sans Thai")
CERT_SIZE_MIN, CERT_SIZE_MAX = 8, 200


def _clamp(v, lo: int, hi: int, fallback: int) -> int:
    """แปลงเป็น int แล้วบีบให้อยู่ในช่วง — ค่าที่แปลงไม่ได้คืน fallback"""
    try:
        return max(lo, min(hi, int(round(float(v)))))
    except (TypeError, ValueError):
        return fallback


def _sanitize_cert_layout(raw: dict) -> dict:
    """รับได้แค่คีย์ที่รู้จัก + บีบค่าให้อยู่ในช่วงที่ปลอดภัย
    กัน payload พิการ (ขนาด 0/ติดลบ/มหึมา หรือชื่อฟอนต์แปลกปลอม) ทำใบประกาศเสีย"""
    if not isinstance(raw, dict):
        raw = {}
    out: dict = {}
    for key in CERT_ITEM_KEYS:
        default = DEFAULT_CERT_LAYOUT[key]
        item = raw.get(key)
        item = item if isinstance(item, dict) else {}
        out[key] = {
            "top": _clamp(item.get("top", default["top"]), 0, 100, default["top"]),
            "left": _clamp(item.get("left", default["left"]), 0, 100, default["left"]),
            "size": _clamp(
                item.get("size", default["size"]),
                CERT_SIZE_MIN,
                CERT_SIZE_MAX,
                default["size"],
            ),
        }
    font = raw.get("font")
    out["font"] = font if font in CERT_FONTS else DEFAULT_CERT_LAYOUT["font"]
    return out


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


@router.get("/print/plans", response_model=list[PrintData])
def print_plans_multi(ids: str, db: Session = Depends(get_db)):
    """ข้อมูลพิมพ์หลายแผนในครั้งเดียว (ติ้กเลือกแล้วพิมพ์รวมหน้าเดียว) — ids คั่นด้วย ','"""
    try:
        id_list = [int(x) for x in ids.split(",") if x.strip()]
    except ValueError:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "รูปแบบ ids ไม่ถูกต้อง")
    if not id_list or len(id_list) > 200:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "จำนวนรายการต้องอยู่ระหว่าง 1-200")
    sigs = _signatures(db)
    result: list[PrintData] = []
    for pid in id_list:
        plan = db.get(PostLessonPlan, pid)
        if not plan:
            continue
        student = db.get(PostStudent, plan.post_student_id)
        if not student:
            continue
        title = db.execute(
            select(PostLesson.title).where(PostLesson.id == plan.post_lesson_id)
        ).scalar()
        result.append(
            PrintData(
                plan=PrintPlan(
                    id=plan.id,
                    post_lesson_id=plan.post_lesson_id,
                    lesson_title=title,
                    sent_date=plan.sent_date,
                    received_date=plan.received_date,
                    lesson_mark=plan.lesson_mark,
                ),
                student=_student_schema(student),
                signatures=sigs,
            )
        )
    if not result:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "ไม่พบแผนการเรียนตามรายการที่เลือก")
    return result


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
            # sanitize ตอนอ่านด้วย — ค่าที่บันทึกไว้ก่อนมีฟีเจอร์นี้ยังไม่มี size/font
            # จะได้ค่า default เติมให้ทีละคีย์ (shallow merge เดิมทำให้ size หาย)
            return _sanitize_cert_layout(json.loads(row.value))
        except (ValueError, TypeError):
            pass
    return DEFAULT_CERT_LAYOUT


@router.put("/settings/certificate-layout", dependencies=[Depends(require_admin)])
def save_certificate_layout(layout: dict, db: Session = Depends(get_db)):
    layout = _sanitize_cert_layout(layout)
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


@router.post(
    "/settings/certificate/signature",
    response_model=Signatures,
    dependencies=[Depends(require_admin)],
)
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
