from datetime import date

from pydantic import BaseModel, ConfigDict


class TeacherCreate(BaseModel):
    first_name: str
    last_name: str | None = None
    phone_number: str | None = None
    address: str | None = None
    tambon: str | None = None
    amphure: str | None = None
    province: str | None = None
    zipcode: str | None = None


class TeacherOut(TeacherCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int


class DriverCreate(BaseModel):
    name: str
    phone_number: str | None = None


class DriverOut(DriverCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int


class GroupStudent(BaseModel):
    first_name: str
    last_name: str | None = ""
    gender: str | None = None
    phone_number: str | None = None


class GroupCreate(BaseModel):
    type: str = "driver"  # driver | network
    post_driver_id: int | None = None
    post_teacher_id: int
    church_name: str | None = None
    registration_date: date | None = None
    students: list[GroupStudent]


class GroupOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    type: str
    post_driver_id: int | None = None
    post_teacher_id: int | None = None
    church_name: str | None = None
    registration_date: date | None = None
