from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from ..core.deps import require_staff
from ..db import get_db
from ..models.post_lesson import PostLesson, PostLessonPlan

router = APIRouter(
    prefix="/api/post-lessons",
    tags=["post-lessons"],
    dependencies=[Depends(require_staff)],
)


class PostLessonIn(BaseModel):
    title: str
    description: str | None = None


class PostLessonOut(BaseModel):
    id: int
    title: str
    description: str | None = None
    plans_count: int = 0


@router.get("", response_model=list[PostLessonOut])
def list_post_lessons(db: Session = Depends(get_db)):
    count_sq = (
        select(PostLessonPlan.post_lesson_id, func.count().label("c"))
        .group_by(PostLessonPlan.post_lesson_id)
        .subquery()
    )
    rows = db.execute(
        select(PostLesson.id, PostLesson.title, PostLesson.description, count_sq.c.c)
        .join(count_sq, count_sq.c.post_lesson_id == PostLesson.id, isouter=True)
        .order_by(PostLesson.id)
    ).all()
    return [
        PostLessonOut(id=r.id, title=r.title, description=r.description, plans_count=r.c or 0)
        for r in rows
    ]


@router.post("", response_model=PostLessonOut, status_code=status.HTTP_201_CREATED)
def create_post_lesson(body: PostLessonIn, db: Session = Depends(get_db)):
    now = datetime.now()
    lesson = PostLesson(title=body.title, description=body.description, created_at=now, updated_at=now)
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return PostLessonOut(id=lesson.id, title=lesson.title, description=lesson.description, plans_count=0)


@router.put("/{lid}", response_model=PostLessonOut)
def update_post_lesson(lid: int, body: PostLessonIn, db: Session = Depends(get_db)):
    lesson = db.get(PostLesson, lid)
    if not lesson:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "ไม่พบบทเรียน")
    lesson.title = body.title
    lesson.description = body.description
    lesson.updated_at = datetime.now()
    db.commit()
    count = db.execute(
        select(func.count()).select_from(PostLessonPlan).where(PostLessonPlan.post_lesson_id == lid)
    ).scalar() or 0
    return PostLessonOut(id=lesson.id, title=lesson.title, description=lesson.description, plans_count=count)


@router.delete("/{lid}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post_lesson(lid: int, db: Session = Depends(get_db)):
    lesson = db.get(PostLesson, lid)
    if lesson:
        db.execute(delete(PostLesson).where(PostLesson.id == lid))
        db.commit()
    return None
