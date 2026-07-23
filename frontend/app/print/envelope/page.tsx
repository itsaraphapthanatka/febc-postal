"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getPrintPlans, logPrintEvent, type PrintData } from "@/lib/print";
import { PaperBatch } from "@/components/print/paper";
import { Envelope, FEBC_ADDRESS, studentAddress } from "@/components/print/envelope";

/** พิมพ์ซองส่งหลายซองใน print job เดียว — /print/envelope?ids=1,2,3&size=B5 */
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
        if (r.plan) logPrintEvent(r.plan.id, 0).catch(() => {});
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp.get("ids")]);

  if (!ids.length) return <div style={{ padding: 40 }}>ไม่ได้ระบุรายการ (ids)</div>;
  if (!items) return <div style={{ padding: 40 }}>กำลังโหลด…</div>;

  return (
    <PaperBatch
      size={size}
      ready
      pages={items.map((d) => (
        <Envelope
          key={d.plan?.id}
          sender={FEBC_ADDRESS}
          recipient={studentAddress(d.student)}
          lessonTitle={d.plan?.lesson_title}
          regNumber={d.student.registration_number}
        />
      ))}
    />
  );
}

export default function EnvelopeBatchPage() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}
