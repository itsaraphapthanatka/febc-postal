"use client";

import { PlanList } from "@/components/plans/plan-list";
import { listLessonPlans } from "@/lib/plans";

export default function LessonPlansPage() {
  return <PlanList title="บทเรียนที่ต้องจัดส่ง" fetcher={listLessonPlans} printKind="delivery" />;
}
