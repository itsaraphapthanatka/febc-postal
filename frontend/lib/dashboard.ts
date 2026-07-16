import { apiFetch } from "./api";

export type Stats = {
  new_students: number;
  confession: number;
  baptism: number;
  plans_created: number;
  plans_sent: number;
  plans_completed: number;
  cert1: number;
  cert2: number;
  cert3: number;
};

export type MonthPoint = {
  month: string;
  new: number;
  gotochurch: number;
  confession: number;
  baptism: number;
};

export type Charts = {
  student_monthly: MonthPoint[];
  by_province: { label: string; count: number }[];
  by_religion: { label: string; count: number }[];
};

function range(start?: string, end?: string) {
  const q = new URLSearchParams();
  if (start) q.set("start", start);
  if (end) q.set("end", end);
  return q.toString();
}

export const getStats = (start?: string, end?: string) =>
  apiFetch<Stats>(`/api/dashboard/stats?${range(start, end)}`);

export const getCharts = (start?: string, end?: string) =>
  apiFetch<Charts>(`/api/dashboard/charts?${range(start, end)}`);
