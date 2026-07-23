import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { UserMenu } from "./user-menu";
import { AuthGuard } from "./auth-guard";
import { UserProvider } from "./user-context";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <UserProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-gradient-to-b from-[var(--theme-gradient-start)] to-[var(--theme-gradient-end)]">
          <div className="flex justify-end px-6 py-3">
            <UserMenu />
          </div>
          <div className="px-6 pb-6">
            <AuthGuard>{children}</AuthGuard>
          </div>
        </main>
      </div>
    </UserProvider>
  );
}
