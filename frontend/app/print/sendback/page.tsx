"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getPrintPlans, logPrintEvent, type PrintData } from "@/lib/print";
import { PaperBatch } from "@/components/print/paper";
import { Envelope, FEBC_ADDRESS, studentAddress } from "@/components/print/envelope";

/** พิมพ์ซองส่งกลับหลายซองใน print job เดียว — /print/sendback?ids=1,2,3&size=B5 */
function Inner() {
  const sp = useSearchParams();
  const size = sp.get("size") ?? "B5";
  const ids = (sp.get("ids") ?? "")
    .split(",")
    .map((s) => Number(s))
    .filter((n) => Number.isFinite(n) && n > 0);
  const [items, setItems] = useState<PrintData[] | null>(null);

  useEffect(() => {
    if (!ids.length) return;
    getPrintPlans(ids).then((rows) => {
      setItems(rows);
      rows.forEach((r) => {
        if (r.plan) logPrintEvent(r.plan.id, 1).catch(() => {});
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp.get("ids")]);

  if (!ids.length) return <div style={{ padding: 40 }}>ไม่ได้ระบุรายการ (ids)</div>;
  if (!items) return <div style={{ padding: 40 }}>กำลังโหลด…</div>;

  // ซองส่งกลับ: ผู้เรียนเป็นผู้ส่ง (บนซ้าย), FEBC เป็นผู้รับ
  return (
    <PaperBatch
      size={size}
      ready
      pages={items.map((d) => (
        <Envelope
          key={d.plan?.id}
          sender={studentAddress(d.student)}
          recipient={FEBC_ADDRESS}
          lessonTitle={d.plan?.lesson_title}
          regNumber={d.student.registration_number}
        />
      ))}
    />
  );
}

export default function SendbackBatchPage() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}
