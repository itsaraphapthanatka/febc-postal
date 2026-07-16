"use client";

import { useEffect, useState } from "react";
import { StatsCard } from "@/components/ui/stats-card";
import { LineChartCard } from "@/components/charts/line-chart-card";
import { PieChartCard } from "@/components/charts/pie-chart-card";
import { getCharts, getStats, type Charts, type Stats } from "@/lib/dashboard";
import { fmt } from "@/lib/utils";

const YEAR = new Date().getFullYear();

export default function DashboardPage() {
  const [start, setStart] = useState(`${YEAR}-01-01`);
  const [end, setEnd] = useState(`${YEAR}-12-31`);
  const [stats, setStats] = useState<Stats | null>(null);
  const [charts, setCharts] = useState<Charts | null>(null);

  useEffect(() => {
    getStats(start, end).then(setStats).catch(() => {});
    getCharts(start, end).then(setCharts).catch(() => {});
  }, [start, end]);

  const dateCls =
    "px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">แดชบอร์ด</h1>
        <div className="flex items-end gap-3">
          <label className="text-sm">
            <span className="block text-[var(--color-text-label)] mb-1">จากวันที่</span>
            <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className={dateCls} />
          </label>
          <label className="text-sm">
            <span className="block text-[var(--color-text-label)] mb-1">ถึงวันที่</span>
            <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className={dateCls} />
          </label>
        </div>
      </div>

      {/* 9 stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard emoji="👥" variant="primary" value={stats ? fmt(stats.new_students) : "…"} label="นักเรียนใหม่" />
        <StatsCard emoji="🙏" variant="success" value={stats ? fmt(stats.confession) : "…"} label="ผู้รับเชื่อ" />
        <StatsCard emoji="💧" variant="info" value={stats ? fmt(stats.baptism) : "…"} label="รับบัพติศมา" />
        <StatsCard emoji="📋" variant="accent" value={stats ? fmt(stats.plans_created) : "…"} label="สร้างแผนการเรียน (ยังไม่ส่ง)" />
        <StatsCard emoji="📮" variant="primary" value={stats ? fmt(stats.plans_sent) : "…"} label="บทเรียนที่ส่งแล้ว" />
        <StatsCard emoji="✅" variant="success" value={stats ? fmt(stats.plans_completed) : "…"} label="รับคืนแล้ว (เรียนจบ)" />
        <StatsCard emoji="📜" variant="blessing" value={stats ? fmt(stats.cert1) : "…"} label="ใบประกาศ ชุดที่ 1" />
        <StatsCard emoji="📜" variant="blessing" value={stats ? fmt(stats.cert2) : "…"} label="ใบประกาศ ชุดที่ 2" />
        <StatsCard emoji="📜" variant="blessing" value={stats ? fmt(stats.cert3) : "…"} label="ใบประกาศ ชุดที่ 3" />
      </div>

      {/* line chart */}
      {charts && (
        <LineChartCard
          title="ข้อมูลนักเรียนรายเดือน"
          data={charts.student_monthly}
          xKey="month"
          series={[
            { key: "new", name: "สมัครใหม่", color: "#005696" },
            { key: "gotochurch", name: "ส่งไปคริสตจักร", color: "#FF8C21" },
            { key: "confession", name: "รับเชื่อ", color: "#A3E635" },
            { key: "baptism", name: "รับบัพติศมา", color: "#38BDF8" },
          ]}
        />
      )}

      {/* pies */}
      {charts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PieChartCard title="นักเรียนตามจังหวัด (สูงสุด 10)" data={charts.by_province} />
          <PieChartCard title="นักเรียนตามศาสนา" data={charts.by_religion} donut />
        </div>
      )}
    </div>
  );
}
