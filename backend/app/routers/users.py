from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from ..core.deps import require_admin
from ..core.security import hash_password
from ..db import get_db
from ..models.user import User
from ..schemas.user_admin import AdminUserCreate, AdminUserOut, AdminUserUpdate

router = APIRouter(prefix="/api/users", tags=["users"])

# บัญชีที่เข้าระบบจัดการได้ = staff หรือ is_admin (ตาราง users ใช้ร่วมกับ Laravel
# ซึ่งมี role student/pastor อยู่ด้วย — ไม่แสดงในหน้าจัดการผู้ใช้)
_manageable = or_(User.role == "staff", User.is_admin == True)  # noqa: E712


def _admin_count(db: Session, exclude_id: int | None = None) -> int:
    q = select(func.count()).select_from(User).where(User.is_admin == True)  # noqa: E712
    if exclude_id is not None:
        q = q.where(User.id != exclude_id)
    return db.execute(q).scalar() or 0


def _email_taken(db: Session, email: str, exclude_id: int | None = None) -> bool:
    q = select(User.id).where(User.email == email)
    if exclude_id is not None:
        q = q.where(User.id != exclude_id)
    return db.execute(q).first() is not None


@router.get("", response_model=list[AdminUserOut])
def list_users(
    q: str | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    stmt = select(User).where(_manageable)
    if q:
        like = f"%{q.strip()}%"
        stmt = stmt.where(or_(User.name.like(like), User.email.like(like)))
    stmt = stmt.order_by(User.is_admin.desc(), User.name)
    return db.execute(stmt).scalars().all()


@router.post("", response_model=AdminUserOut, status_code=status.HTTP_201_CREATED)
def create_user(
    body: AdminUserCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    if _email_taken(db, body.email):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "อีเมลนี้ถูกใช้แล้ว")
    now = datetime.now()
    user = User(
        name=body.name,
        email=body.email,
        password=hash_password(body.password),
        role="staff",
        is_admin=body.is_admin,
        created_at=now,
        updated_at=now,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.patch("/{uid}", response_model=AdminUserOut)
def update_user(
    uid: int,
    body: AdminUserUpdate,
    db: Session = Depends(get_db),
    current: User = Depends(require_admin),
):
    user = db.get(User, uid)
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "ไม่พบผู้ใช้")

    if body.is_admin is False and user.is_admin:
        if user.id == current.id:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "ลดสิทธิ์ผู้ดูแลของตัวเองไม่ได้")
        if _admin_count(db, exclude_id=user.id) == 0:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "ต้องเหลือผู้ดูแลระบบอย่างน้อย 1 คน")

    if body.email is not None and _email_taken(db, body.email, exclude_id=user.id):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "อีเมลนี้ถูกใช้แล้ว")

    if body.name is not None:
        user.name = body.name
    if body.email is not None:
        user.email = body.email
    if body.password:
        user.password = hash_password(body.password)
    if body.is_admin is not None:
        user.is_admin = body.is_admin
        # บัญชีที่ถูกตั้งเป็น admin/user ต้อง login ได้เสมอ
        if user.role != "staff":
            user.role = "staff"
    user.updated_at = datetime.now()
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{uid}")
def revoke_user(
    uid: int,
    db: Session = Depends(get_db),
    current: User = Depends(require_admin),
):
    """ถอนสิทธิ์เข้าระบบ (ไม่ลบแถว — ตาราง users ใช้ร่วมกับ Laravel/ระบบสมาชิกเดิม)"""
    user = db.get(User, uid)
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "ไม่พบผู้ใช้")
    if user.id == current.id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "ถอนสิทธิ์ตัวเองไม่ได้")
    if user.is_admin and _admin_count(db, exclude_id=user.id) == 0:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "ต้องเหลือผู้ดูแลระบบอย่างน้อย 1 คน")
    user.role = "student"
    user.is_admin = False
    user.updated_at = datetime.now()
    db.commit()
    return {"status": "ok"}
