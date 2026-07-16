from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db import Base


class PostStudent(Base):
    __tablename__ = "post_students"

    id: Mapped[int] = mapped_column(primary_key=True)
    registration_number: Mapped[str] = mapped_column(String(255))
    registration_date: Mapped[date | None] = mapped_column(Date)
    first_name: Mapped[str] = mapped_column(String(255))
    last_name: Mapped[str] = mapped_column(String(255))
    gender: Mapped[str | None] = mapped_column(String(10))
    religion: Mapped[str | None] = mapped_column(String(10))
    address: Mapped[str | None] = mapped_column(String(255))
    tambon: Mapped[str | None] = mapped_column(String(255))
    amphure: Mapped[str | None] = mapped_column(String(255))
    province: Mapped[str | None] = mapped_column(String(255))
    zipcode: Mapped[str | None] = mapped_column(String(255))
    phone_number: Mapped[str | None] = mapped_column(String(13))
    age: Mapped[str | None] = mapped_column(String(3))
    profession: Mapped[str | None] = mapped_column(String(255))
    birthday_date: Mapped[date | None] = mapped_column(Date)
    church_name: Mapped[str | None] = mapped_column(String(255))
    post_group_id: Mapped[int | None] = mapped_column(Integer)
    post_teacher_id: Mapped[int | None] = mapped_column(Integer)
    send_to_church_date: Mapped[date | None] = mapped_column(Date)
    program: Mapped[str | None] = mapped_column(String(200))
    confession_date: Mapped[date | None] = mapped_column(Date)
    baptism_date: Mapped[date | None] = mapped_column(Date)
    serving: Mapped[str | None] = mapped_column(Text)
    note: Mapped[str | None] = mapped_column(Text)
    has_testimony: Mapped[bool | None] = mapped_column(Boolean, default=False)
    testimony_file: Mapped[str | None] = mapped_column(String(255))
    created_at: Mapped[datetime | None] = mapped_column(DateTime)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime)

    lesson_plans: Mapped[list["PostLessonPlan"]] = relationship(
        "PostLessonPlan",
        primaryjoin="PostStudent.id == foreign(PostLessonPlan.post_student_id)",
        viewonly=True,
    )
