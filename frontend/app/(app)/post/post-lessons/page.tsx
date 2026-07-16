"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  createPostLesson,
  deletePostLesson,
  getPostLessons,
  updatePostLesson,
  type PostLesson,
} from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { fmt } from "@/lib/utils";

const inp =
  "w-full px-3 py-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]";

export default function PostLessonsPage() {
  const [lessons, setLessons] = useState<PostLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [draft, setDraft] = useState({ title: "", description: "" });

  const load = () => {
    setLoading(true);
    getPostLessons().then(setLessons).finally(() => setLoading(false));
  };
  useEffect(load, []);

  function startEdit(l: PostLesson) {
    setEditingId(l.id);
    setDraft({ title: l.title, description: l.description ?? "" });
  }
  function startNew() {
    setEditingId("new");
    setDraft({ title: "", description: "" });
  }

  async function save() {
    if (!draft.title.trim()) return;
    if (editingId === "new") {
      await createPostLesson({ title: draft.title, description: draft.description || null });
    } else if (typeof editingId === "number") {
      await updatePostLesson(editingId, { title: draft.title, description: draft.description || null });
    }
    setEditingId(null);
    load();
  }

  async function onDelete(id: number) {
    if (!confirm("ต้องการลบบทเรียนนี้?")) return;
    await deletePostLesson(id);
    load();
  }

  const EditRow = ({ idLabel }: { idLabel: string }) => (
    <tr className="border-t border-[var(--color-border)] bg-[var(--color-primary-surface)]/40">
      <td className="px-4 py-2 text-[var(--color-text-muted)]">{idLabel}</td>
      <td className="px-4 py-2"><input className={inp} placeholder="ชื่อบทเรียน" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></td>
      <td className="px-4 py-2"><input className={inp} placeholder="รายละเอียด" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></td>
      <td className="px-4 py-2">-</td>
      <td className="px-4 py-2">
        <div className="flex justify-end gap-1">
          <Button className="px-3 py-1.5" onClick={save}>บันทึก</Button>
          <Button variant="ghost" className="px-3 py-1.5" onClick={() => setEditingId(null)}>ยกเลิก</Button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-primary)]">บทเรียน (ข้อมูลหลัก)</h1>
          <p className="text-sm text-[var(--color-text-label)]">ทั้งหมด {fmt(lessons.length)} บทเรียน</p>
        </div>
        <Button onClick={startNew} disabled={editingId === "new"}><Plus size={16} /> เพิ่มบทเรียน</Button>
      </div>

      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-sm)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--color-primary-surface)] text-[var(--color-primary)] text-left">
              <th className="px-4 py-3 font-semibold w-16">ID</th>
              <th className="px-4 py-3 font-semibold">ชื่อบทเรียน</th>
              <th className="px-4 py-3 font-semibold">รายละเอียด</th>
              <th className="px-4 py-3 font-semibold w-40">จำนวนแผนการเรียน</th>
              <th className="px-4 py-3 font-semibold text-right w-40">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {editingId === "new" && <EditRow idLabel="ใหม่" />}
            {loading && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-[var(--color-text-muted)]">กำลังโหลด…</td></tr>
            )}
            {!loading && lessons.map((l) =>
              editingId === l.id ? (
                <EditRow key={l.id} idLabel={String(l.id)} />
              ) : (
                <tr key={l.id} className="border-t border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-colors">
                  <td className="px-4 py-3 font-medium text-[var(--color-primary-dark)]">{l.id}</td>
                  <td className="px-4 py-3">{l.title}</td>
                  <td className="px-4 py-3 text-[var(--color-text-label)]">{l.description ?? "-"}</td>
                  <td className="px-4 py-3">{fmt(l.plans_count)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button variant="secondary" className="px-2.5 py-1.5" onClick={() => startEdit(l)}><Pencil size={13} /> แก้ไข</Button>
                      <Button variant="danger" className="px-2.5 py-1.5" onClick={() => onDelete(l.id)}><Trash2 size={13} /></Button>
                    </div>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
