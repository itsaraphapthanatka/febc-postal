"use client";

import { use, useEffect, useState } from "react";
import {
  getCertLayout,
  getPrintPlan,
  logPrintEvent,
  type CertLayout,
  type PrintData,
} from "@/lib/print";
import { CertSheet, CertStyle } from "@/components/print/certificate-sheet";

export default function CertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<PrintData | null>(null);
  const [layout, setLayout] = useState<CertLayout | null>(null);

  useEffect(() => {
    getPrintPlan(Number(id)).then((d) => {
      setData(d);
      logPrintEvent(Number(id), 0).catch(() => {});
    });
    getCertLayout().then(setLayout).catch(() => {});
  }, [id]);

  useEffect(() => {
    if (data && layout) {
      if (new URLSearchParams(window.location.search).get("preview")) return;
      const t = setTimeout(() => window.print(), 700);
      return () => clearTimeout(t);
    }
  }, [data, layout]);

  if (!data || !data.plan || !layout)
    return <div style={{ padding: 40 }}>กำลังโหลด…</div>;

  return (
    <>
      <CertStyle />
      <CertSheet data={data} layout={layout} />
    </>
  );
}
