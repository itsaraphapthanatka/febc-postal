from datetime import date, datetime

from pydantic import BaseModel


class PrintStudent(BaseModel):
    id: int
    registration_number: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    address: str | None = None
    tambon: str | None = None
    amphure: str | None = None
    province: str | None = None
    zipcode: str | None = None
    profession: str | None = None


class PrintPlan(BaseModel):
    id: int
    post_lesson_id: int | None = None
    lesson_title: str | None = None
    sent_date: datetime | None = None
    received_date: date | None = None
    lesson_mark: str | None = None


class Signatures(BaseModel):
    director: str | None = None
    section_head: str | None = None


class PrintData(BaseModel):
    plan: PrintPlan | None = None
    student: PrintStudent
    signatures: Signatures


class PrintEvent(BaseModel):
    post_lesson_plan_id: int
    go_or_back: int = 0
    stamp_sent: bool = True
