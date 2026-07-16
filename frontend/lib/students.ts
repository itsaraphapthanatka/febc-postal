import { apiFetch, API_URL } from "./api";

export type Student = {
  id: number;
  registration_number: string;
  registration_date?: string | null;
  first_name: string;
  last_name: string;
  gender?: string | null;
  religion?: string | null;
  address?: string | null;
  tambon?: string | null;
  amphure?: string | null;
  province?: string | null;
  zipcode?: string | null;
  phone_number?: string | null;
  age?: string | null;
  profession?: string | null;
  birthday_date?: string | null;
  church_name?: string | null;
  send_to_church_date?: string | null;
  program?: string | null;
  confession_date?: string | null;
  baptism_date?: string | null;
  serving?: string | null;
  note?: string | null;
  has_testimony?: boolean | null;
  testimony_file?: string | null;
};

export type PageResult<T> = {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
};

export function listStudents(params: {
  page?: number;
  per_page?: number;
  search?: string;
  province?: string;
  funnel?: string;
}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  });
  return apiFetch<PageResult<Student>>(`/api/students?${qs.toString()}`);
}

export const getStudent = (id: number) => apiFetch<Student>(`/api/students/${id}`);

export const createStudent = (data: Partial<Student>) =>
  apiFetch<Student>("/api/students", { method: "POST", body: JSON.stringify(data) });

export const updateStudent = (id: number, data: Partial<Student>) =>
  apiFetch<Student>(`/api/students/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteStudent = (id: number) =>
  apiFetch<void>(`/api/students/${id}`, { method: "DELETE" });

export const nextCode = (type: "individual" | "network" = "individual") =>
  apiFetch<{ registration_number: string }>(`/api/students/next-code?type=${type}`);

// geo cascade
export const getProvinces = () => apiFetch<string[]>("/api/geo/provinces");
export const getAmphures = (province: string) =>
  apiFetch<string[]>(`/api/geo/amphures?province=${encodeURIComponent(province)}`);
export const getTambons = (amphure: string) =>
  apiFetch<{ name_th: string; zip_code: number | null }[]>(
    `/api/geo/tambons?amphure=${encodeURIComponent(amphure)}`,
  );

// lookups
export const getProfessions = () => apiFetch<string[]>("/api/lookups/professions");
export const getReligions = () =>
  apiFetch<{ short_name: string; name: string | null }[]>("/api/lookups/religions");

export async function uploadTestimony(id: number, file: File) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_URL}/api/students/${id}/testimony`, {
    method: "POST",
    credentials: "include",
    body: fd,
  });
  if (!res.ok) throw new Error(`upload ${res.status}`);
  return (await res.json()) as Student;
}
