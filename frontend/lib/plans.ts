import { apiFetch } from "./api";
import type { PageResult } from "./students";

export type PlanWithStudent = {
  id: number;
  post_student_id: number | null;
  registration_number: string | null;
  first_name: string | null;
  last_name: string | null;
  lesson_title: string | null;
  sent_date: string | null;
  received_date: string | null;
  lesson_mark: string | null;
};

export type LessonPlanRow = {
  id: number;
  post_lesson_id: number | null;
  lesson_title: string | null;
  sent_date: string | null;
  received_date: string | null;
  lesson_mark: string | null;
};

type ListParams = { page?: number; per_page?: number; search?: string };

function qs(params: Record<string, unknown>) {
  const s = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") s.set(k, String(v));
  });
  return s.toString();
}

export const listLessonPlans = (p: ListParams) =>
  apiFetch<PageResult<PlanWithStudent>>(`/api/lesson-plans?${qs(p)}`);

export const listCertificates = (p: ListParams) =>
  apiFetch<PageResult<PlanWithStudent>>(`/api/certificates?${qs(p)}`);

export const listGraduates = (p: ListParams) =>
  apiFetch<PageResult<PlanWithStudent>>(`/api/graduates?${qs(p)}`);

export const getStudentPlans = (sid: number) =>
  apiFetch<LessonPlanRow[]>(`/api/students/${sid}/lesson-plans`);

export const updateStudentPlans = (
  sid: number,
  rows: { id: number; sent_date: string | null; received_date: string | null; lesson_mark: string | null }[],
) =>
  apiFetch<LessonPlanRow[]>(`/api/students/${sid}/lesson-plans`, {
    method: "PUT",
    body: JSON.stringify(rows),
  });

export type PostLesson = {
  id: number;
  title: string;
  description: string | null;
  plans_count: number;
};

export const getPostLessons = () => apiFetch<PostLesson[]>("/api/post-lessons");

export const createPostLesson = (data: { title: string; description?: string | null }) =>
  apiFetch<PostLesson>("/api/post-lessons", { method: "POST", body: JSON.stringify(data) });

export const updatePostLesson = (id: number, data: { title: string; description?: string | null }) =>
  apiFetch<PostLesson>(`/api/post-lessons/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deletePostLesson = (id: number) =>
  apiFetch<void>(`/api/post-lessons/${id}`, { method: "DELETE" });
