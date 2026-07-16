"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import {
  deleteStudent,
  getProvinces,
  listStudents,
  type PageResult,
  type Student,
} from "@/lib/students";
import { Button } from "@/components/ui/button";
import { fmt } from "@/lib/utils";

const FUNNEL_TITLES: Record<string, string> = {
  confession: "นักเรียนที่รับเชื่อ",
  baptism: "นักเรียนที่รับบัพติศมา",
  gotochurch: "นักเรียนที่ส่งไปคริสตจักร",
  serving: "นักเรียนที่รับใช้",
};

function StudentsInner() {
  const sp = useSearchParams();
  const funnel = sp.get("funnel") ?? undefined;

  const [data, setData] = useState<PageResult<Student> | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [province, setProvince] = useState("");
  const [provinces, setProvinces] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    listStudents({ page, per_page: 20, search, province, funnel })
      .then(setData)
      .finally(() => setLoading(false));
  }, [page, search, province, funnel]);

  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    getProvinces().then(setProvinces).catch(() => {});
  }, []);
  useEffect(() => {
    setPage(1);
  }, [funnel]);

  async function onDelete(id: number) {
    if (!confirm("ต้องการลบนักเรียนคนนี้?")) return;
    await deleteStudent(id);
    load();
  }

  const title = funnel ? FUNNEL_TITLES[funnel] ?? "นักเรียน" : "นักเรียนทั้งหมด";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-primary)]">{title}</h1>
          <p className="text-sm text-[var(--color-text-label)]">
            ทั้งหมด {data ? fmt(data.total) : "…"} คน
          </p>
        </div>
        <Link href="/post/students/new">
          <Button>
            <Plus size={16} /> สร้างนักเรียน
          </Button>
        </Link>
      </div>

      {/* filters */}
      <div className="flex flex-wrap gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setSearch(searchInput);
          }}
          className="flex gap-2 flex-1 min-w-[240px]"
        >
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
            />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="ค้นหา รหัส / ชื่อ / นามสกุล / เบอร์โทร"
              className="w-full pl-9 pr-4 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
          <Button type="submit" variant="secondary">
            ค้นหา
          </Button>
        </form>
        <select
          value={province}
          onChange={(e) => {
            setPage(1);
            setProvince(e.target.value);
          }}
          className="px-4 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        >
          <option value="">ทุกจังหวัด</option>
          {provinces.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* table */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-sm)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--color-primary-surface)] text-[var(--color-primary)] text-left">
                <th className="px-4 py-3 font-semibold">รหัสนักเรียน</th>
                <th className="px-4 py-3 font-semibold">ชื่อ - นามสกุล</th>
                <th className="px-4 py-3 font-semibold">เพศ</th>
                <th className="px-4 py-3 font-semibold">อายุ</th>
                <th className="px-4 py-3 font-semibold">จังหวัด</th>
                <th className="px-4 py-3 font-semibold">เบอร์โทร</th>
                <th className="px-4 py-3 font-semibold">อาชีพ</th>
                <th className="px-4 py-3 font-semibold text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-[var(--color-text-muted)]">
                    กำลังโหลด…
                  </td>
                </tr>
              )}
              {!loading && data?.items.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-[var(--color-text-muted)]">
                    ไม่พบข้อมูล
                  </td>
                </tr>
              )}
              {!loading &&
                data?.items.map((s) => (
                  <tr
                    key={s.id}
                    className="border-t border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-[var(--color-primary-dark)]">
                      {s.registration_number}
                    </td>
                    <td className="px-4 py-3">
                      {s.first_name} {s.last_name}
                    </td>
                    <td className="px-4 py-3">{s.gender ?? "-"}</td>
                    <td className="px-4 py-3">{s.age ?? "-"}</td>
                    <td className="px-4 py-3">{s.province ?? "-"}</td>
                    <td className="px-4 py-3">{s.phone_number ?? "-"}</td>
                    <td className="px-4 py-3">{s.profession ?? "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/post/students/${s.id}`}>
                          <Button variant="secondary" className="px-2 py-1.5">
                            <Pencil size={14} />
                          </Button>
                        </Link>
                        <Button
                          variant="danger"
                          className="px-2 py-1.5"
                          onClick={() => onDelete(s.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* pagination */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--color-text-label)]">
            หน้า {data.page} / {data.pages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ก่อนหน้า
            </Button>
            <Button
              variant="secondary"
              disabled={page >= data.pages}
              onClick={() => setPage((p) => p + 1)}
            >
              ถัดไป
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudentsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-[var(--color-text-muted)]">กำลังโหลด…</div>}>
      <StudentsInner />
    </Suspense>
  );
}
