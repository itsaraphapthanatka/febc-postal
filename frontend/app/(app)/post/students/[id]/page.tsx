"use client";

import { use, useEffect, useState } from "react";
import { getStudent, type Student } from "@/lib/students";
import { StudentForm } from "@/components/students/student-form";

export default function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [student, setStudent] = useState<Student | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    getStudent(Number(id))
      .then(setStudent)
      .catch((e) => setErr((e as Error).message));
  }, [id]);

  if (err)
    return (
      <div className="p-4 rounded-[var(--radius-lg)] bg-[var(--color-error-surface)] text-[var(--color-error-dark)]">
        ⚠️ {err}
      </div>
    );
  if (!student)
    return <div className="text-[var(--color-text-muted)]">กำลังโหลด…</div>;

  return (
    <div className="space-y-5 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">
          แก้ไขนักเรียน
        </h1>
        <p className="text-sm text-[var(--color-text-label)]">
          {student.registration_number} — {student.first_name} {student.last_name}
        </p>
      </div>
      <StudentForm student={student} />
    </div>
  );
}
