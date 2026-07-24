FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# system deps (pymysql needs none; keep image lean)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# production: ไม่ใช้ --reload; worker เดียว (rate-limit login เป็น in-memory ตาม CUTOVER.md)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
