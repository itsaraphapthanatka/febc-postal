"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Search, ShieldCheck, UserX, X } from "lucide-react";
import {
  createUser,
  getUsers,
  revokeUser,
  updateUser,
  type AdminUser,
} from "@/lib/users";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/components/layout/user-context";

const inp =
  "w-full px-3 py-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]";

type Draft = { name: string; email: string; password: string; is_admin: boolean };
const emptyDraft: Draft = { name: "", email: "", password: "", is_admin: false };

export default function UsersPage() {
  const router = useRouter();
  const { user: me, loading: meLoading } = useCurrentUser();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [error, setError] = useState<string | null>(null);

  // หน้าเฉพาะ admin — user ปกติเด้งกลับแดชบอร์ด
  useEffect(() => {
    if (!meLoading && me && !me.is_admin) router.replace("/post/dashboard");
  }, [meLoading, me, router]);

  const load = (search?: string) => {
    setLoading(true);
    getUsers(search)
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };
  useEffect(() => load(), []);

  function startNew() {
    setError(null);
    setEditingId("new");
    setDraft(emptyDraft);
  }
  function startEdit(u: AdminUser) {
    setError(null);
    setEditingId(u.id);
    setDraft({ name: u.name ?? "", email: u.email ?? "", password: "", is_admin: !!u.is_admin });
  }

  async function save() {
    setError(null);
    try {
      if (editingId === "new") {
        await createUser(draft);
      } else if (typeof editingId === "number") {
        await updateUser(editingId, {
          name: draft.name,
          email: draft.email,
          is_admin: draft.is_admin,
          ...(draft.password ? { password: draft.password } : {}),
        });
      }
      setEditingId(null);
      load(q || undefined);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "บันทึกไม่สำเร็จ");
    }
  }

  async function onRevoke(u: AdminUser) {
    if (!confirm(`ถอนสิทธิ์เข้าระบบของ "${u.name ?? u.email}"?`)) return;
    setError(null);
    try {
      await revokeUser(u.id);
      load(q || undefined);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "ถอนสิทธิ์ไม่สำเร็จ");
    }
  }

  if (meLoading || !me?.is_admin) return null;

  const canSave =
    draft.name.trim() &&
    draft.email.trim() &&
    (editingId !== "new" || draft.password.length >= 8);

  const EditCells = () => (
    <>
      <td className="px-4 py-2">
        <input className={inp} placeholder="ชื่อ" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
      </td>
      <td className="px-4 py-2">
        <input className={inp} type="email" placeholder="อีเมล" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
      </td>
      <td className="px-4 py-2">
        <select className={inp} value={draft.is_admin ? "admin" : "user"} onChange={(e) => setDraft({ ...draft, is_admin: e.target.value === "admin" })}>
          <option value="user">user — งานข้อมูล</option>
          <option value="admin">admin — ผู้ดูแลระบบ</option>
        </select>
      </td>
      <td className="px-4 py-2">
        <input
          className={inp}
          type="password"
          placeholder={editingId === "new" ? "รหัสผ่าน (อย่างน้อย 8 ตัว)" : "เว้นว่าง = ไม่เปลี่ยน"}
          value={draft.password}
          onChange={(e) => setDraft({ ...draft, password: e.target.value })}
        />
      </td>
      <td className="px-4 py-2 text-right whitespace-nowrap">
        <Button onClick={save} disabled={!canSave} className="px-3 py-1.5">บันทึก</Button>
        <Button variant="ghost" onClick={() => setEditingId(null)} className="px-2 py-1.5 ml-1"><X size={16} /></Button>
      </td>
    </>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-[var(--color-text-heading)]">ผู้ใช้ระบบ</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              className={`${inp} pl-9 w-64`}
              placeholder="ค้นหาชื่อหรืออีเมล…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load(q || undefined)}
            />
          </div>
          <Button onClick={startNew}><Plus size={16} /> เพิ่มผู้ใช้</Button>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-[var(--radius-sm)] bg-[var(--color-error-surface)] text-[var(--color-error-dark)] text-sm">
          {error}
        </div>
      )}

      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[var(--color-text-label)]">
              <th className="px-4 py-3 font-semibold">ชื่อ</th>
              <th className="px-4 py-3 font-semibold">อีเมล</th>
              <th className="px-4 py-3 font-semibold">สิทธิ์</th>
              <th className="px-4 py-3 font-semibold">รหัสผ่าน</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {editingId === "new" && (
              <tr className="border-t border-[var(--color-border)] bg-[var(--color-primary-surface)]/40">
                <EditCells />
              </tr>
            )}
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-[var(--color-text-muted)]">กำลังโหลด…</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-[var(--color-text-muted)]">ไม่พบผู้ใช้</td></tr>
            ) : (
              users.map((u) =>
                editingId === u.id ? (
                  <tr key={u.id} className="border-t border-[var(--color-border)] bg-[var(--color-primary-surface)]/40">
                    <EditCells />
                  </tr>
                ) : (
                  <tr key={u.id} className="border-t border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]">
                    <td className="px-4 py-3 font-medium">
                      {u.name ?? "-"}
                      {u.id === me.id && <span className="ml-2 text-xs text-[var(--color-text-muted)]">(คุณ)</span>}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-body)]">{u.email ?? "-"}</td>
                    <td className="px-4 py-3">
                      {u.is_admin ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--color-primary-surface)] text-[var(--color-primary)]">
                          <ShieldCheck size={12} /> admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--color-surface-hover)] text-[var(--color-text-body)]">
                          user
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">••••••••</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Button variant="ghost" onClick={() => startEdit(u)} className="px-2 py-1.5" title="แก้ไข">
                        <Pencil size={16} />
                      </Button>
                      {u.id !== me.id && (
                        <Button variant="danger" onClick={() => onRevoke(u)} className="px-2 py-1.5" title="ถอนสิทธิ์เข้าระบบ">
                          <UserX size={16} />
                        </Button>
                      )}
                    </td>
                  </tr>
                ),
              )
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-[var(--color-text-muted)]">
        admin = จัดการผู้ใช้และตั้งค่าระบบได้ · user = ทำงานข้อมูล (นักเรียน/บทเรียน/พิมพ์เอกสาร) ·
        การถอนสิทธิ์ไม่ลบบัญชีออกจากฐานข้อมูล เพียงปิดการเข้าระบบจัดการ
      </p>
    </div>
  );
}
