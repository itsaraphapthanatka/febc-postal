import os

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from sqlalchemy.orm import Session

from .config import settings
from .db import get_db
from .routers import (
    auth,
    dashboard,
    geo,
    groups,
    lesson_plans,
    lookups,
    post_lessons,
    print_router,
    students,
    users,
)

app = FastAPI(title="FEBC Postal API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(settings.MEDIA_DIR, exist_ok=True)
app.mount("/media", StaticFiles(directory=settings.MEDIA_DIR), name="media")


app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(students.router)
app.include_router(lesson_plans.router)
app.include_router(groups.router)
app.include_router(post_lessons.router)
app.include_router(print_router.router)
app.include_router(geo.router)
app.include_router(lookups.router)
app.include_router(users.router)


@app.get("/api/ping")
def ping():
    return {"status": "ok", "service": "febc-postal-api"}


@app.get("/api/health/db")
def health_db(db: Session = Depends(get_db)):
    students = db.execute(text("SELECT COUNT(*) FROM post_students")).scalar()
    lessons = db.execute(text("SELECT COUNT(*) FROM post_lessons")).scalar()
    return {"status": "ok", "post_students": students, "post_lessons": lessons}
