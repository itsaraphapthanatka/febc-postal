"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStudent, type Student } from "@/lib/students";
import { getStudentPlans, updateStudentPlans, type LessonPlanRow } from "@/lib/plans";
import { Button } from "@/components/ui/button";

type Editable = {
  id: number;
  lesson_title: string | null;
  sent_date: string;
  received_date: string;
  lesson_mark: string;
};

const cell =
  "w-full px-3 py-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]";

export default function StudentPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const sid = Number(id);
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [rows, setRows] = useState<Editable[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getStudent(sid).then(setStudent).catch(() => {});
    getStudentPlans(sid).then((data: LessonPlanRow[]) =>
      setRows(
        data.map((r) => ({
          id: r.id,
          lesson_title: r.lesson_title,
          sent_date: r.sent_date?.slice(0, 10) ?? "",
          received_date: r.received_date?.slice(0, 10) ?? "",
          lesson_mark: r.lesson_mark ?? "",
        })),
      ),
    );
  }, [sid]);

  function upd(i: number, key: keyof Editable, val: string) {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, [key]: val } : r)));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    try {
      await updateStudentPlans(
        sid,
        rows.map((r) => ({
          id: r.id,
          sent_date: r.sent_date || null,
          received_date: r.received_date || null,
          lesson_mark: r.lesson_mark || null,
        })),
      );
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">แผนการเรียนรายคน</h1>
        {student && (
          <p className="text-sm text-[var(--color-text-label)]">
            {student.registration_number} — {student.first_name} {student.last_name}
          </p>
        )}
      </div>

      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-sm)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--color-primary-surface)] text-[var(--color-primary)] text-left">
              <th className="px-4 py-3 font-semibold w-1/3">บทเรียน</th>
              <th className="px-4 py-3 font-semibold">วันที่ส่ง</th>
              <th className="px-4 py-3 font-semibold">วันที่รับคืน</th>
              <th className="px-4 py-3 font-semibold w-28">คะแนน</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} className="border-t border-[var(--color-border)]">
                <td className="px-4 py-2 font-medium text-[var(--color-text-body)]">
                  {r.lesson_title}
                </td>
                <td className="px-4 py-2">
                  <input type="date" className={cell} value={r.sent_date} onChange={(e) => upd(i, "sent_date", e.target.value)} />
                </td>
                <td className="px-4 py-2">
                  <input type="date" className={cell} value={r.received_date} onChange={(e) => upd(i, "received_date", e.target.value)} />
                </td>
                <td className="px-4 py-2">
                  <input className={cell} value={r.lesson_mark} onChange={(e) => upd(i, "lesson_mark", e.target.value)} />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-[var(--color-text-muted)]">กำลังโหลด…</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={saving} className="px-8">
          {saving ? "กำลังบันทึก…" : "บันทึกแผนการเรียน"}
        </Button>
        <Button variant="ghost" onClick={() => router.push("/post/students")}>กลับ</Button>
        {saved && <span className="text-sm text-[var(--color-success-dark)]">✓ บันทึกแล้ว</span>}
      </div>
    </div>
  );
}
