"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  getCertLayout,
  getPrintPlans,
  logPrintEvent,
  type CertLayout,
  type PrintData,
} from "@/lib/print";
import { CertSheet, CertStyle } from "@/components/print/certificate-sheet";

/** พิมพ์ใบประกาศหลายใบใน print job เดียว — /print/certificate?ids=1,2,3 */
function Inner() {
  const sp = useSearchParams();
  const ids = (sp.get("ids") ?? "")
    .split(",")
    .map((s) => Number(s))
    .filter((n) => Number.isFinite(n) && n > 0);
  const [items, setItems] = useState<PrintData[] | null>(null);
  const [layout, setLayout] = useState<CertLayout | null>(null);

  useEffect(() => {
    if (!ids.length) return;
    getPrintPlans(ids).then((rows) => {
      setItems(rows);
      rows.forEach((r) => {
        if (r.plan) logPrintEvent(r.plan.id, 0).catch(() => {});
      });
    });
    getCertLayout().then(setLayout).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp.get("ids")]);

  useEffect(() => {
    if (items?.length && layout) {
      const t = setTimeout(() => window.print(), 700);
      return () => clearTimeout(t);
    }
  }, [items, layout]);

  if (!ids.length) return <div style={{ padding: 40 }}>ไม่ได้ระบุรายการ (ids)</div>;
  if (!items || !layout) return <div style={{ padding: 40 }}>กำลังโหลด…</div>;

  return (
    <>
      <CertStyle />
      {items.map((d) => (
        <CertSheet key={d.plan?.id} data={d} layout={layout} />
      ))}
    </>
  );
}

export default function CertificateBatchPage() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}
