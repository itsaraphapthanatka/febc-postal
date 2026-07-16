from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class StudentBase(BaseModel):
    registration_date: date | None = None
    first_name: str
    last_name: str = ""
    gender: str | None = None
    religion: str | None = None
    address: str | None = None
    tambon: str | None = None
    amphure: str | None = None
    province: str | None = None
    zipcode: str | None = None
    phone_number: str | None = None
    age: str | None = None
    profession: str | None = None
    birthday_date: date | None = None
    church_name: str | None = None
    send_to_church_date: date | None = None
    program: str | None = None
    confession_date: date | None = None
    baptism_date: date | None = None
    serving: str | None = None
    note: str | None = None
    has_testimony: bool | None = False
    testimony_file: str | None = None


class StudentCreate(StudentBase):
    # ว่างไว้ได้ → ระบบรันรหัสเดิมให้อัตโนมัติ
    registration_number: str | None = None


class StudentUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    registration_number: str | None = None
    registration_date: date | None = None
    first_name: str | None = None
    last_name: str | None = None
    gender: str | None = None
    religion: str | None = None
    address: str | None = None
    tambon: str | None = None
    amphure: str | None = None
    province: str | None = None
    zipcode: str | None = None
    phone_number: str | None = None
    age: str | None = None
    profession: str | None = None
    birthday_date: date | None = None
    church_name: str | None = None
    send_to_church_date: date | None = None
    program: str | None = None
    confession_date: date | None = None
    baptism_date: date | None = None
    serving: str | None = None
    note: str | None = None
    has_testimony: bool | None = None
    testimony_file: str | None = None


class StudentOut(StudentBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    registration_number: str
    created_at: datetime | None = None
    updated_at: datetime | None = None
