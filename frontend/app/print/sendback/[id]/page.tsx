"use client";

import { Suspense, use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getPrintPlan, logPrintEvent, type PrintData } from "@/lib/print";
import { Paper } from "@/components/print/paper";
import { Envelope, FEBC_ADDRESS, studentAddress } from "@/components/print/envelope";

function Inner({ id }: { id: number }) {
  const sp = useSearchParams();
  const size = sp.get("size") ?? "B5";
  const [data, setData] = useState<PrintData | null>(null);

  useEffect(() => {
    getPrintPlan(id).then((d) => {
      setData(d);
      logPrintEvent(id, 1).catch(() => {});
    });
  }, [id]);

  if (!data) return <div style={{ padding: 40 }}>กำลังโหลด…</div>;
  // ซองส่งกลับ: ผู้เรียนเป็นผู้ส่ง (บนซ้าย), FEBC เป็นผู้รับ
  return (
    <Paper size={size} ready>
      <Envelope
        sender={studentAddress(data.student)}
        recipient={FEBC_ADDRESS}
        lessonTitle={data.plan?.lesson_title}
        regNumber={data.student.registration_number}
      />
    </Paper>
  );
}

export default function SendbackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense>
      <Inner id={Number(id)} />
    </Suspense>
  );
}
