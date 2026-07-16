from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from ..config import settings


def verify_password(plain: str, hashed: str) -> bool:
    """ตรวจรหัสผ่านกับ hash เดิมของ Laravel (bcrypt $2y$ → normalize เป็น $2b$)"""
    if not hashed:
        return False
    if hashed.startswith("$2y$"):
        hashed = "$2b$" + hashed[4:]
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except (ValueError, TypeError):
        return False


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def create_access_token(sub: int, role: str | None, is_admin: bool | None) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(sub),
        "role": role,
        "is_admin": bool(is_admin),
        "iat": now,
        "exp": now + timedelta(minutes=settings.JWT_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
