"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { getMe, logout, type CurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export function UserMenu() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    getMe().then(setUser).catch(() => setUser(null));
  }, []);

  const displayName =
    user?.name || [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.email || "ผู้ใช้";

  async function handleLogout() {
    await logout().catch(() => {});
    router.replace("/login");
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-sm font-bold">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm font-medium text-[var(--color-text-body)] hidden sm:block">
          {displayName}
        </span>
      </div>
      <Button variant="ghost" onClick={handleLogout} className="px-2 py-1.5">
        <LogOut size={16} />
        <span className="hidden sm:block">ออกจากระบบ</span>
      </Button>
    </div>
  );
}
