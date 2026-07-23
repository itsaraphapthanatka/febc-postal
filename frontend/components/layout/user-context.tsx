"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getMe, type CurrentUser } from "@/lib/auth";

type UserState = {
  user: CurrentUser | null;
  loading: boolean;
  /** โหลดข้อมูลผู้ใช้ใหม่ (เช่น หลังแก้ชื่อตัวเอง) */
  refresh: () => void;
};

const UserContext = createContext<UserState>({ user: null, loading: true, refresh: () => {} });

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  };
  useEffect(refresh, []);

  return (
    <UserContext.Provider value={{ user, loading, refresh }}>{children}</UserContext.Provider>
  );
}

export function useCurrentUser() {
  return useContext(UserContext);
}
