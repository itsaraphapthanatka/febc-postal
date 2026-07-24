import { apiFetch, API_URL } from "./api";

export type PrintStudent = {
  id: number;
  registration_number: string | null;
  first_name: string | null;
  last_name: string | null;
  address: string | null;
  tambon: string | null;
  amphure: string | null;
  province: string | null;
  zipcode: string | null;
  profession: string | null;
};

export type PrintPlan = {
  id: number;
  post_lesson_id: number | null;
  lesson_title: string | null;
  sent_date: string | null;
  received_date: string | null;
  lesson_mark: string | null;
};

export type Signatures = { director: string | null; section_head: string | null };

export type PrintData = {
  plan: PrintPlan | null;
  student: PrintStudent;
  signatures: Signatures;
};

/** ซองหนึ่งใบต่อนักเรียนหนึ่งคน — รวมบทเรียนที่เลือกไว้ทั้งหมดของนักเรียนคนเดียวกันไว้ในซองเดียว */
export type EnvelopeGroup = {
  student: PrintStudent;
  lessonTitles: string[];
  planIds: number[];
};

/** จัดกลุ่มแผนการเรียนตามนักเรียน คงลำดับที่พบครั้งแรกไว้ */
export function groupByStudent(rows: PrintData[]): EnvelopeGroup[] {
  const byStudent = new Map<number, EnvelopeGroup>();
  for (const r of rows) {
    let g = byStudent.get(r.student.id);
    if (!g) {
      g = { student: r.student, lessonTitles: [], planIds: [] };
      byStudent.set(r.student.id, g);
    }
    if (r.plan) {
      g.planIds.push(r.plan.id);
      if (r.plan.lesson_title) g.lessonTitles.push(r.plan.lesson_title);
    }
  }
  return [...byStudent.values()];
}

export const getPrintPlan = (id: number) => apiFetch<PrintData>(`/api/print/plan/${id}`);
export const getPrintPlans = (ids: number[]) =>
  apiFetch<PrintData[]>(`/api/print/plans?ids=${ids.join(",")}`);
export const getPrintStudent = (id: number) => apiFetch<PrintData>(`/api/print/student/${id}`);

export const logPrintEvent = (post_lesson_plan_id: number, go_or_back: number, stamp_sent = true) =>
  apiFetch("/api/print-events", {
    method: "POST",
    body: JSON.stringify({ post_lesson_plan_id, go_or_back, stamp_sent }),
  });

export const getCertSettings = () => apiFetch<Signatures>("/api/settings/certificate");

export async function uploadSignature(which: "director" | "section_head", file: File) {
  const fd = new FormData();
  fd.append("which", which);
  fd.append("file", file);
  const res = await fetch(`${API_URL}/api/settings/certificate/signature`, {
    method: "POST",
    credentials: "include",
    body: fd,
  });
  if (!res.ok) throw new Error(`upload ${res.status}`);
  return (await res.json()) as Signatures;
}

export const mediaUrl = (path: string) => `${API_URL}/media/${path}`;

export type Pos = { top: number; left: number };
export type CertLayout = {
  name: Pos;
  date: Pos;
  hours: Pos;
  section_head: Pos;
  director: Pos;
};

export const getCertLayout = () => apiFetch<CertLayout>("/api/settings/certificate-layout");

export const saveCertLayout = (layout: CertLayout) =>
  apiFetch("/api/settings/certificate-layout", {
    method: "PUT",
    body: JSON.stringify(layout),
  });
