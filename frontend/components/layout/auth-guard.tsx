"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe, type CurrentUser } from "@/lib/auth";

type Ctx = { user: CurrentUser | null };

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<"loading" | "ok">("loading");

  useEffect(() => {
    getMe()
      .then(() => setState("ok"))
      .catch(() => router.replace("/login"));
  }, [router]);

  if (state === "loading") {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 rounded-xl bg-gray-200 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-[var(--radius-lg)] bg-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
