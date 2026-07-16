from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from ..config import settings
from ..db import get_db
from ..models.user import User
from .security import decode_token


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    token = request.cookies.get(settings.COOKIE_NAME)
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "ยังไม่ได้เข้าสู่ระบบ")
    try:
        payload = decode_token(token)
    except Exception:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "เซสชันไม่ถูกต้องหรือหมดอายุ")
    user = db.get(User, int(payload["sub"]))
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "ไม่พบผู้ใช้")
    return user


def require_staff(user: User = Depends(get_current_user)) -> User:
    """RBAC: เฉพาะ staff หรือ admin (ปิดช่องโหว่ /post เดิมที่ไม่มี gate)"""
    if not (user.role == "staff" or user.is_admin):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "ต้องเป็นเจ้าหน้าที่จึงเข้าใช้งานได้")
    return user
