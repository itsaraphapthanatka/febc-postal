export type NavItem = {
  label: string;
  emoji: string;
  href?: string;
  /** แสดงเฉพาะ admin (is_admin) */
  adminOnly?: boolean;
  children?: { label: string; href: string; adminOnly?: boolean }[];
};

/** เมนูฝั่ง postal (mirror /post panel groups) */
export const NAV: NavItem[] = [
  { label: "แดชบอร์ด", emoji: "📊", href: "/post/dashboard" },
  {
    label: "นักเรียน",
    emoji: "👥",
    children: [
      { label: "นักเรียนทั้งหมด", href: "/post/students" },
      { label: "สมัครเรียนแบบกลุ่ม", href: "/post/groups" },
      { label: "รับเชื่อ", href: "/post/students?funnel=confession" },
      { label: "รับบัพติศมา", href: "/post/students?funnel=baptism" },
      { label: "ส่งไปคริสตจักร", href: "/post/students?funnel=gotochurch" },
      { label: "รับใช้", href: "/post/students?funnel=serving" },
    ],
  },
  {
    label: "การจัดส่ง",
    emoji: "📮",
    children: [
      { label: "บทเรียนที่ต้องจัดส่ง", href: "/post/lesson-plans" },
      { label: "รายชื่อได้ใบประกาศ", href: "/post/certificates" },
      { label: "นักเรียนที่จบการศึกษา", href: "/post/graduates" },
    ],
  },
  {
    label: "ข้อมูลหลัก",
    emoji: "🗂️",
    children: [{ label: "บทเรียน", href: "/post/post-lessons" }],
  },
  {
    label: "ตั้งค่า",
    emoji: "⚙️",
    adminOnly: true,
    children: [
      { label: "ตั้งค่าใบประกาศ", href: "/post/settings/certificate", adminOnly: true },
      { label: "ผู้ใช้ระบบ", href: "/post/users", adminOnly: true },
    ],
  },
];
