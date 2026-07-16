from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..config import settings
from ..core import ratelimit
from ..core.deps import get_current_user
from ..core.security import create_access_token, verify_password
from ..db import get_db
from ..models.user import User
from ..schemas.auth import LoginRequest, UserOut

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=UserOut)
def login(
    body: LoginRequest,
    response: Response,
    request: Request,
    db: Session = Depends(get_db),
):
    ip = request.client.host if request.client else "?"
    key = f"{ip}:{body.email.lower()}"
    if ratelimit.is_blocked(key, settings.LOGIN_MAX_ATTEMPTS, settings.LOGIN_DECAY_MINUTES * 60):
        raise HTTPException(
            status.HTTP_429_TOO_MANY_REQUESTS,
            f"พยายามเข้าสู่ระบบบ่อยเกินไป กรุณารอ {settings.LOGIN_DECAY_MINUTES} นาที",
        )

    user = db.execute(
        select(User).where(User.email == body.email)
    ).scalar_one_or_none()

    if not user or not verify_password(body.password, user.password or ""):
        ratelimit.record_failure(key)
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "อีเมลหรือรหัสผ่านไม่ถูกต้อง")

    if not (user.role == "staff" or user.is_admin):
        raise HTTPException(
            status.HTTP_403_FORBIDDEN, "บัญชีนี้ไม่มีสิทธิ์เข้าระบบจัดการ"
        )

    ratelimit.reset(key)
    token = create_access_token(user.id, user.role, user.is_admin)
    response.set_cookie(
        key=settings.COOKIE_NAME,
        value=token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=settings.JWT_EXPIRE_MINUTES * 60,
        path="/",
    )
    return user


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(settings.COOKIE_NAME, path="/")
    return {"status": "ok"}
