"use client";

import { PlanList } from "@/components/plans/plan-list";
import { listGraduates } from "@/lib/plans";

export default function GraduatesPage() {
  return <PlanList title="นักเรียนที่จบการศึกษา" fetcher={listGraduates} showMark={false} />;
}
