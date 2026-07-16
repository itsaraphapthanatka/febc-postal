from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..core.deps import require_staff
from ..db import get_db
from ..models.lookup import ThaiAmphure, ThaiProvince, ThaiTambon

router = APIRouter(
    prefix="/api/geo",
    tags=["geo"],
    dependencies=[Depends(require_staff)],
)


@router.get("/provinces")
def provinces(db: Session = Depends(get_db)) -> list[str]:
    return db.execute(
        select(ThaiProvince.name_th).order_by(ThaiProvince.name_th)
    ).scalars().all()


@router.get("/amphures")
def amphures(province: str, db: Session = Depends(get_db)) -> list[str]:
    return db.execute(
        select(ThaiAmphure.name_th)
        .where(ThaiAmphure.province_name == province)
        .order_by(ThaiAmphure.name_th)
    ).scalars().all()


@router.get("/tambons")
def tambons(amphure: str, db: Session = Depends(get_db)):
    rows = db.execute(
        select(ThaiTambon.name_th, ThaiTambon.zip_code)
        .where(ThaiTambon.amphure_name == amphure)
        .order_by(ThaiTambon.name_th)
    ).all()
    return [{"name_th": r[0], "zip_code": r[1]} for r in rows]
