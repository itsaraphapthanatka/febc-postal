"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input, FormField } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      await login(email, password);
      router.replace("/post/dashboard");
    } catch (e) {
      setErr((e as Error).message || "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-[var(--theme-gradient-start)] to-[var(--theme-gradient-end)]">
      <div className="w-full max-w-md bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-[var(--shadow-xl)] border border-[var(--color-border)] p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🧡</div>
          <h1 className="text-2xl font-bold text-[var(--color-primary)]">
            FEBC ไปรษณีย์
          </h1>
          <p className="text-sm text-[var(--color-text-label)] mt-1">
            ระบบจัดการบทเรียนทางไปรษณีย์
          </p>
        </div>

        {err && (
          <div className="mb-4 p-3 rounded-[var(--radius-md)] bg-[var(--color-error-surface)] border border-[var(--color-error)] text-[var(--color-error-dark)] text-sm">
            ⚠️ {err}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <FormField label="อีเมล" htmlFor="email">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="username"
            />
          </FormField>
          <FormField label="รหัสผ่าน" htmlFor="password">
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </FormField>
          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-[var(--radius-md)]"
          >
            {loading ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
          </Button>
        </form>
      </div>
    </div>
  );
}
