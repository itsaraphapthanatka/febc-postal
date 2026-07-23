from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class AdminUserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str | None = None
    name: str | None = None
    is_admin: bool | None = None
    created_at: datetime | None = None


class AdminUserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    is_admin: bool = False


class AdminUserUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    email: EmailStr | None = None
    # เว้นว่าง = ไม่เปลี่ยนรหัสผ่าน
    password: str | None = Field(default=None, min_length=8, max_length=72)
    is_admin: bool | None = None
