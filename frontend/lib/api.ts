/**
 * ค่า "same-origin" = ยิง API ผ่าน path สัมพัทธ์ (/api, /media) ให้ reverse proxy
 * ส่งต่อไป backend เอง — ใช้ตอน deploy หลัง nginx เพื่อไม่ต้อง rebuild bundle
 * ใหม่ทุกครั้งที่เปลี่ยนโดเมน/IP (NEXT_PUBLIC_* ถูกฝังลง bundle ตอน build)
 */
const configuredApiUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";

export const API_URL =
  configuredApiUrl === "same-origin" ? "" : configuredApiUrl;

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** fetch helper — แนบ cookie (JWT) เสมอ, โยน ApiError เมื่อไม่ ok */
export async function apiFetch<T = unknown>(
  path: string,
  opts: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers ?? {}),
    },
  });
  if (!res.ok) {
    let msg = `${res.status}`;
    try {
      const body = await res.json();
      msg = body.detail ?? JSON.stringify(body);
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, msg);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
