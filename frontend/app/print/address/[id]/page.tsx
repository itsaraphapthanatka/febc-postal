"use client";

import { Suspense, use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getPrintStudent, type PrintData } from "@/lib/print";
import { Paper } from "@/components/print/paper";
import { Envelope, FEBC_ADDRESS, studentAddress } from "@/components/print/envelope";

function Inner({ id }: { id: number }) {
  const sp = useSearchParams();
  const size = sp.get("size") ?? "B5";
  const [data, setData] = useState<PrintData | null>(null);

  useEffect(() => {
    getPrintStudent(id).then(setData);
  }, [id]);

  if (!data) return <div style={{ padding: 40 }}>กำลังโหลด…</div>;
  return (
    <Paper size={size} ready>
      <Envelope
        sender={FEBC_ADDRESS}
        recipient={studentAddress(data.student)}
        regNumber={data.student.registration_number}
      />
    </Paper>
  );
}

export default function AddressPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense>
      <Inner id={Number(id)} />
    </Suspense>
  );
}
