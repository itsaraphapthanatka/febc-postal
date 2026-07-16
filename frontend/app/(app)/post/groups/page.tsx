"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { listGroups, type GroupRow } from "@/lib/groups";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { fmt } from "@/lib/utils";

export default function GroupsPage() {
  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listGroups().then(setGroups).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">สมัครเรียนแบบกลุ่ม</h1>
        <Link href="/post/groups/new">
          <Button><Plus size={16} /> สมัครกลุ่มใหม่</Button>
        </Link>
      </div>

      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-sm)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--color-primary-surface)] text-[var(--color-primary)] text-left">
                <th className="px-4 py-3 font-semibold">#</th>
                <th className="px-4 py-3 font-semibold">ประเภท</th>
                <th className="px-4 py-3 font-semibold">ครูผู้สอน</th>
                <th className="px-4 py-3 font-semibold">ผู้ขับเคลื่อน</th>
                <th className="px-4 py-3 font-semibold">คริสตจักร</th>
                <th className="px-4 py-3 font-semibold">จำนวนผู้เรียน</th>
                <th className="px-4 py-3 font-semibold">วันที่ลงทะเบียน</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} className="px-4 py-8 text-center text-[var(--color-text-muted)]">กำลังโหลด…</td></tr>}
              {!loading && groups.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-[var(--color-text-muted)]">ยังไม่มีกลุ่ม — กด “สมัครกลุ่มใหม่”</td></tr>}
              {groups.map((g) => (
                <tr key={g.id} className="border-t border-[var(--color-border)]">
                  <td className="px-4 py-3">{g.id}</td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={g.type === "network" ? "blessing" : "info"}>
                      {g.type === "network" ? "แม่ข่าย" : "ผู้ขับเคลื่อน"}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3">{g.teacher_name ?? "-"}</td>
                  <td className="px-4 py-3">{g.driver_name ?? "-"}</td>
                  <td className="px-4 py-3">{g.church_name ?? "-"}</td>
                  <td className="px-4 py-3">{fmt(g.students_count)}</td>
                  <td className="px-4 py-3">{g.registration_date ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
