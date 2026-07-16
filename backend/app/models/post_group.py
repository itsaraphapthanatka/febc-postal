from datetime import date, datetime

from sqlalchemy import Date, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from ..db import Base


class PostTeacher(Base):
    __tablename__ = "post_teachers"

    id: Mapped[int] = mapped_column(primary_key=True)
    first_name: Mapped[str] = mapped_column(String(255))
    last_name: Mapped[str | None] = mapped_column(String(255))
    phone_number: Mapped[str | None] = mapped_column(String(20))
    address: Mapped[str | None] = mapped_column(String(255))
    tambon: Mapped[str | None] = mapped_column(String(255))
    amphure: Mapped[str | None] = mapped_column(String(255))
    province: Mapped[str | None] = mapped_column(String(255))
    zipcode: Mapped[str | None] = mapped_column(String(10))
    created_at: Mapped[datetime | None] = mapped_column(DateTime)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime)


class PostDriver(Base):
    __tablename__ = "post_drivers"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    phone_number: Mapped[str | None] = mapped_column(String(20))
    created_at: Mapped[datetime | None] = mapped_column(DateTime)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime)


class PostGroup(Base):
    __tablename__ = "post_groups"

    id: Mapped[int] = mapped_column(primary_key=True)
    type: Mapped[str] = mapped_column(String(20))  # driver | network
    post_driver_id: Mapped[int | None] = mapped_column(Integer)
    post_teacher_id: Mapped[int | None] = mapped_column(Integer)
    church_name: Mapped[str | None] = mapped_column(String(255))
    registration_date: Mapped[date | None] = mapped_column(Date)
    created_at: Mapped[datetime | None] = mapped_column(DateTime)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime)
