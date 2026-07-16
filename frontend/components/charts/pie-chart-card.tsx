"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

// Aunjai palette (FEBC blue → accent → status/blessing)
const PALETTE = [
  "#005696", "#FF8C21", "#38BDF8", "#7C3AED", "#A3E635",
  "#3378B0", "#E07000", "#0284C7", "#A78BFA", "#F59E0B", "#94A3B8",
];

export function PieChartCard({
  title,
  data,
  donut = false,
}: {
  title: string;
  data: { label: string; count: number }[];
  donut?: boolean;
}) {
  return (
    <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-6 border border-[var(--color-border)] shadow-[var(--shadow-sm)]">
      <h3 className="text-lg font-bold text-[var(--color-primary)] mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="label"
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={donut ? 55 : 0}
            paddingAngle={1}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
