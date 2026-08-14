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

/** ความกว้างใบประกาศจริง (A4 แนวนอน 29.7cm ที่ 96dpi) — ใช้เทียบสเกลตอนพรีวิว */
export const CERT_SHEET_W = 1123;

/** ฟอนต์ที่เลือกได้ — ต้องตรงกับรายการใน backend (print_router.CERT_FONTS)
 *  และกับ @import ใน CertStyle ห้ามรับค่าอิสระจากผู้ใช้ (กัน CSS injection) */
export const CERT_FONTS = ["Sarabun", "Prompt", "Kanit", "Noto Sans Thai"] as const;
export type CertFont = (typeof CERT_FONTS)[number];

/** @import ของฟอนต์ทั้งหมดใน CERT_FONTS — สตริงคงที่ ใช้ร่วมกันระหว่าง
 *  หน้าพิมพ์ (CertStyle) กับหน้าตั้งค่า (พรีวิว) ให้เห็นฟอนต์เดียวกัน
 *  แก้ที่นี่ที่เดียวเมื่อเพิ่มฟอนต์ และต้องเพิ่มใน CERT_FONTS + backend ด้วย */
export const CERT_FONT_IMPORT_CSS =
  "@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700" +
  "&family=Prompt:wght@400;600;700&family=Kanit:wght@400;600;700" +
  "&family=Noto+Sans+Thai:wght@400;600;700&display=swap');";

export const CERT_FONT_FALLBACK: CertFont = "Sarabun";
export const isCertFont = (v: unknown): v is CertFont =>
  typeof v === "string" && (CERT_FONTS as readonly string[]).includes(v);

/** ขนาดฟอนต์/ความสูงลายเซ็นที่อนุญาต (px บนใบจริง) */
export const CERT_SIZE_MIN = 8;
export const CERT_SIZE_MAX = 200;

export const CERT_ITEM_KEYS = ["name", "date", "hours", "section_head", "director"] as const;
export type CertItemKey = (typeof CERT_ITEM_KEYS)[number];

/** top/left = % ของใบประกาศ (จุดกึ่งกลาง element)
 *  size = px บนใบจริง — ข้อความคือ font-size, ลายเซ็นคือความสูงรูป */
export type Pos = { top: number; left: number; size: number };

export type CertLayout = Record<CertItemKey, Pos> & { font: CertFont };

export const getCertLayout = () => apiFetch<CertLayout>("/api/settings/certificate-layout");

export const saveCertLayout = (layout: CertLayout) =>
  apiFetch("/api/settings/certificate-layout", {
    method: "PUT",
    body: JSON.stringify(layout),
  });
