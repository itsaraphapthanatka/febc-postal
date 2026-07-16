import { AppShell } from "@/components/layout/app-shell";

export default function PostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
