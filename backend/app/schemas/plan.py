from datetime import date, datetime

from pydantic import BaseModel


class LessonPlanRow(BaseModel):
    """แถวแผนเรียนของนักเรียน 1 คน (สำหรับหน้าแผนการเรียนรายคน 9 ช่อง)"""
    id: int
    post_lesson_id: int | None = None
    lesson_title: str | None = None
    sent_date: datetime | None = None
    received_date: date | None = None
    lesson_mark: str | None = None


class StudentPlanUpdate(BaseModel):
    id: int
    sent_date: datetime | None = None
    received_date: date | None = None
    lesson_mark: str | None = None


class PlanWithStudent(BaseModel):
    """แถวแผนเรียนพร้อมข้อมูลนักเรียน (delivery queue / ใบประกาศ / จบการศึกษา)"""
    id: int
    post_student_id: int | None = None
    registration_number: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    lesson_title: str | None = None
    sent_date: datetime | None = None
    received_date: date | None = None
    lesson_mark: str | None = None
