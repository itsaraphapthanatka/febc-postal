"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Printer, Search } from "lucide-react";
import type { PlanWithStudent } from "@/lib/plans";
import type { PageResult } from "@/lib/students";
import { Button } from "@/components/ui/button";
import { fmt } from "@/lib/utils";

function d(s: string | null): string {
  return s ? s.slice(0, 10) : "-";
}

export function PlanList({
  title,
  fetcher,
  showMark = true,
  printKind,
}: {
  title: string;
  fetcher: (p: { page: number; per_page: number; search: string }) => Promise<PageResult<PlanWithStudent>>;
  showMark?: boolean;
  printKind?: "delivery" | "certificate";
}) {
  const [data, setData] = useState<PageResult<PlanWithStudent> | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [size, setSize] = useState("B5");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetcher({ page, per_page: 20, search }).then(setData).finally(() => setLoading(false));
  }, [page, search, fetcher]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-primary)]">{title}</h1>
          <p className="text-sm text-[var(--color-text-label)]">ทั้งหมด {data ? fmt(data.total) : "…"} รายการ</p>
        </div>
        {printKind === "delivery" && (
          <label className="text-sm flex items-center gap-2">
            <span className="text-[var(--color-text-label)]">ขนาดกระดาษ</span>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="A4">A4</option>
              <option value="A5">A5</option>
              <option value="B5">B5</option>
            </select>
          </label>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setSearch(searchInput);
        }}
        className="flex gap-2 max-w-md"
      >
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="ค้นหา รหัส / ชื่อ นักเรียน"
            className="w-full pl-9 pr-4 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>
        <Button type="submit" variant="secondary">ค้นหา</Button>
      </form>

      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-sm)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--color-primary-surface)] text-[var(--color-primary)] text-left">
                <th className="px-4 py-3 font-semibold">รหัสนักเรียน</th>
                <th className="px-4 py-3 font-semibold">ชื่อ - นามสกุล</th>
                <th className="px-4 py-3 font-semibold">บทเรียน</th>
                <th className="px-4 py-3 font-semibold">วันที่ส่ง</th>
                <th className="px-4 py-3 font-semibold">วันที่รับคืน</th>
                {showMark && <th className="px-4 py-3 font-semibold">คะแนน</th>}
                <th className="px-4 py-3 font-semibold text-right">พิมพ์ / จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-[var(--color-text-muted)]">กำลังโหลด…</td></tr>
              )}
              {!loading && data?.items.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-[var(--color-text-muted)]">ไม่พบข้อมูล</td></tr>
              )}
              {!loading && data?.items.map((r) => (
                <tr key={r.id} className="border-t border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-colors">
                  <td className="px-4 py-3 font-medium text-[var(--color-primary-dark)]">{r.registration_number}</td>
                  <td className="px-4 py-3">{r.first_name} {r.last_name}</td>
                  <td className="px-4 py-3">{r.lesson_title ?? "-"}</td>
                  <td className="px-4 py-3">{d(r.sent_date)}</td>
                  <td className="px-4 py-3">{d(r.received_date)}</td>
                  {showMark && <td className="px-4 py-3">{r.lesson_mark ?? "-"}</td>}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      {printKind === "delivery" && (
                        <>
                          <a href={`/print/envelope/${r.id}?size=${size}`} target="_blank" rel="noreferrer">
                            <Button variant="secondary" className="px-2.5 py-1.5"><Printer size={13} /> ซองส่ง</Button>
                          </a>
                          <a href={`/print/sendback/${r.id}?size=${size}`} target="_blank" rel="noreferrer">
                            <Button variant="secondary" className="px-2.5 py-1.5"><Printer size={13} /> ส่งกลับ</Button>
                          </a>
                        </>
                      )}
                      {printKind === "certificate" && (
                        <a href={`/print/certificate/${r.id}`} target="_blank" rel="noreferrer">
                          <Button className="px-2.5 py-1.5"><Printer size={13} /> ใบประกาศ</Button>
                        </a>
                      )}
                      {r.post_student_id && (
                        <Link href={`/post/students/${r.post_student_id}/plan`}>
                          <Button variant="ghost" className="px-2.5 py-1.5">แผนเรียน</Button>
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {data && data.pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--color-text-label)]">หน้า {data.page} / {data.pages}</span>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>ก่อนหน้า</Button>
            <Button variant="secondary" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>ถัดไป</Button>
          </div>
        </div>
      )}
    </div>
  );
}
