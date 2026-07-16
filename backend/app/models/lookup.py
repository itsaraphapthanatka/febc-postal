from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from ..db import Base


class Profession(Base):
    __tablename__ = "professions"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))


class Religion(Base):
    __tablename__ = "religions"
    id: Mapped[int] = mapped_column(primary_key=True)
    short_name: Mapped[str] = mapped_column(String(10))
    name: Mapped[str | None] = mapped_column(String(25))


class ThaiProvince(Base):
    __tablename__ = "thai_provinces"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=False)
    name_th: Mapped[str] = mapped_column(String(150))
    name_en: Mapped[str | None] = mapped_column(String(150))
    geography_id: Mapped[int | None] = mapped_column(Integer)


class ThaiAmphure(Base):
    __tablename__ = "thai_amphures"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=False)
    name_th: Mapped[str] = mapped_column(String(150))
    name_en: Mapped[str | None] = mapped_column(String(150))
    province_id: Mapped[int | None] = mapped_column(Integer)
    province_name: Mapped[str | None] = mapped_column(String(255))


class ThaiTambon(Base):
    __tablename__ = "thai_tambons"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=False)
    zip_code: Mapped[int | None] = mapped_column(Integer)
    name_th: Mapped[str] = mapped_column(String(150))
    name_en: Mapped[str | None] = mapped_column(String(150))
    amphure_id: Mapped[int | None] = mapped_column(Integer)
    amphure_name: Mapped[str | None] = mapped_column(String(255))
