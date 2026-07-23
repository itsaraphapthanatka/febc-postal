import re
from datetime import date

from sqlalchemy import text
from sqlalchemy.orm import Session


def next_individual(db: Session, suffix: str = "") -> str:
    """รหัสเดิม: ต่อจากรหัสของนักเรียนที่สร้าง 'ล่าสุด' + 1 แล้วต่อ '/'+อักษร

    อิงลำดับการสร้าง (id) ไม่ใช่ MAX(เลข) — ในฐานมีรหัสเก่าคีย์ผิด (เช่น 70302/ก
    ปี 2018) ซึ่ง MAX จะไปคว้ามาแล้วทำให้รหัสกระโดด (ตรงกับพฤติกรรมระบบเดิม)
    """
    row = db.execute(
        text(
            "SELECT registration_number FROM post_students "
            "WHERE SUBSTRING_INDEX(registration_number,'/',-1) NOT REGEXP '^[0-9]{4}$' "
            "AND registration_number REGEXP '^[0-9]+/' "
            "ORDER BY id DESC "
            "LIMIT 1"
        )
    ).scalar()
    n = 0
    if row:
        try:
            n = int(str(row).split("/")[0])
        except ValueError:
            n = 0
    return f"{n + 1}/{suffix}"


def next_network(db: Session, d: date) -> str:
    """รหัสแม่ข่าย: MM{ลำดับ4หลัก}/YYYY (ค.ศ.)"""
    mm = d.strftime("%m")
    yyyy = d.strftime("%Y")
    rows = db.execute(
        text(
            "SELECT registration_number FROM post_students "
            "WHERE registration_number LIKE :pat"
        ),
        {"pat": f"{mm}%/{yyyy}"},
    ).scalars().all()
    pattern = re.compile(rf"^{mm}(\d{{4}})/{yyyy}$")
    mx = 0
    for code in rows:
        m = pattern.match(str(code))
        if m:
            mx = max(mx, int(m.group(1)))
    return f"{mm}{mx + 1:04d}/{yyyy}"
