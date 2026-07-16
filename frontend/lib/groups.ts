import { apiFetch } from "./api";

export type Teacher = {
  id: number;
  first_name: string;
  last_name?: string | null;
  phone_number?: string | null;
  address?: string | null;
  tambon?: string | null;
  amphure?: string | null;
  province?: string | null;
  zipcode?: string | null;
};

export type Driver = { id: number; name: string; phone_number?: string | null };

export type GroupRow = {
  id: number;
  type: string;
  teacher_name: string | null;
  driver_name: string | null;
  church_name: string | null;
  registration_date: string | null;
  students_count: number;
};

export type GroupStudentInput = {
  first_name: string;
  last_name?: string;
  gender?: string;
  phone_number?: string;
};

export const listTeachers = () => apiFetch<Teacher[]>("/api/teachers");
export const createTeacher = (data: Partial<Teacher>) =>
  apiFetch<Teacher>("/api/teachers", { method: "POST", body: JSON.stringify(data) });

export const listDrivers = () => apiFetch<Driver[]>("/api/drivers");
export const createDriver = (data: Partial<Driver>) =>
  apiFetch<Driver>("/api/drivers", { method: "POST", body: JSON.stringify(data) });

export const listGroups = () => apiFetch<GroupRow[]>("/api/groups");

export const createGroup = (data: {
  type: string;
  post_driver_id?: number | null;
  post_teacher_id: number;
  church_name?: string | null;
  registration_date?: string | null;
  students: GroupStudentInput[];
}) => apiFetch<{ id: number }>("/api/groups", { method: "POST", body: JSON.stringify(data) });
