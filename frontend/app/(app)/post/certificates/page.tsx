"use client";

import { PlanList } from "@/components/plans/plan-list";
import { listCertificates } from "@/lib/plans";

export default function CertificatesPage() {
  return <PlanList title="รายชื่อนักเรียนที่ได้ใบประกาศ" fetcher={listCertificates} printKind="certificate" />;
}
