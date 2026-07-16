import { apiFetch } from "./api";

export type CurrentUser = {
  id: number;
  email: string | null;
  name: string | null;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  is_admin: boolean | null;
  avatar: string | null;
};

export function login(email: string, password: string) {
  return apiFetch<CurrentUser>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function getMe() {
  return apiFetch<CurrentUser>("/api/auth/me");
}

export function logout() {
  return apiFetch("/api/auth/logout", { method: "POST" });
}
