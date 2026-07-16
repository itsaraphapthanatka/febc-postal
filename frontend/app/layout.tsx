import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FEBC ไปรษณีย์ — Admin",
  description: "ระบบจัดการบทเรียนทางไปรษณีย์ FEBC Thailand",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="antialiased">{children}</body>
    </html>
  );
}
