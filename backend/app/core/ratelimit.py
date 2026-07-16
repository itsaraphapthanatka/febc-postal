"""ตัวจำกัดจำนวนครั้ง login แบบ in-memory (พอสำหรับ single-process)

Production หลาย worker ควรย้ายไปใช้ Redis. คีย์ = ip + email.
"""
import time
from collections import defaultdict

_attempts: dict[str, list[float]] = defaultdict(list)


def is_blocked(key: str, max_attempts: int, decay_seconds: int) -> bool:
    now = time.time()
    fresh = [t for t in _attempts[key] if now - t < decay_seconds]
    _attempts[key] = fresh
    return len(fresh) >= max_attempts


def record_failure(key: str) -> None:
    _attempts[key].append(time.time())


def reset(key: str) -> None:
    _attempts.pop(key, None)
