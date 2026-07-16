"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function LineChartCard({
  title,
  data,
  xKey,
  series,
}: {
  title: string;
  data: Record<string, unknown>[];
  xKey: string;
  series: { key: string; name: string; color: string }[];
}) {
  return (
    <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-6 border border-[var(--color-border)] shadow-[var(--shadow-sm)]">
      <h3 className="text-lg font-bold text-[var(--color-primary)] mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "var(--color-text-label)" }} />
          <YAxis tick={{ fontSize: 11, fill: "var(--color-text-label)" }} allowDecimals={false} />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
