from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..core.deps import require_staff
from ..db import get_db
from ..models.lookup import Profession, Religion

router = APIRouter(
    prefix="/api/lookups",
    tags=["lookups"],
    dependencies=[Depends(require_staff)],
)


@router.get("/professions")
def professions(db: Session = Depends(get_db)) -> list[str]:
    return db.execute(
        select(Profession.name).distinct().order_by(Profession.name)
    ).scalars().all()


@router.get("/religions")
def religions(db: Session = Depends(get_db)):
    rows = db.execute(select(Religion.short_name, Religion.name)).all()
    return [{"short_name": r[0], "name": r[1]} for r in rows]
