from datetime import date, datetime

from sqlalchemy import Date, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from ..db import Base


class PostLesson(Base):
    __tablename__ = "post_lessons"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime | None] = mapped_column(DateTime)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime)


class PostLessonPlan(Base):
    __tablename__ = "post_lesson_plans"

    id: Mapped[int] = mapped_column(primary_key=True)
    post_student_id: Mapped[int | None] = mapped_column(Integer)
    post_lesson_id: Mapped[int | None] = mapped_column(Integer)
    sent_date: Mapped[datetime | None] = mapped_column(DateTime)
    received_date: Mapped[date | None] = mapped_column(Date)
    lesson_mark: Mapped[str | None] = mapped_column(String(10))
    created_at: Mapped[datetime | None] = mapped_column(DateTime)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime)


class PostPrintHistory(Base):
    __tablename__ = "post_print_histories"

    id: Mapped[int] = mapped_column(primary_key=True)
    post_lesson_plan_id: Mapped[int | None] = mapped_column(Integer)
    go_or_back: Mapped[int | None] = mapped_column(Integer)
    created_at: Mapped[datetime | None] = mapped_column(DateTime)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime)
