import { apiFetch } from "./api";

export type AdminUser = {
  id: number;
  email: string | null;
  name: string | null;
  is_admin: boolean | null;
  created_at: string | null;
};

export function getUsers(q?: string) {
  const qs = q ? `?q=${encodeURIComponent(q)}` : "";
  return apiFetch<AdminUser[]>(`/api/users${qs}`);
}

export function createUser(body: {
  name: string;
  email: string;
  password: string;
  is_admin: boolean;
}) {
  return apiFetch<AdminUser>("/api/users", { method: "POST", body: JSON.stringify(body) });
}

export function updateUser(
  id: number,
  body: Partial<{ name: string; email: string; password: string; is_admin: boolean }>,
) {
  return apiFetch<AdminUser>(`/api/users/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}

export function revokeUser(id: number) {
  return apiFetch(`/api/users/${id}`, { method: "DELETE" });
}
