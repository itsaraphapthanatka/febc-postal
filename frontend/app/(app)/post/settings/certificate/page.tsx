"use client";

import { useEffect, useState } from "react";
import { getCertSettings, mediaUrl, uploadSignature, type Signatures } from "@/lib/print";
import { CertLayoutEditor } from "@/components/print/cert-layout-editor";

function SignatureBox({
  which,
  label,
  current,
  onUploaded,
}: {
  which: "director" | "section_head";
  label: string;
  current: string | null;
  onUploaded: (s: Signatures) => void;
}) {
  const [busy, setBusy] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    try {
      onUploaded(await uploadSignature(which, f));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-[var(--color-text-body)]">{label}</p>
      <div className="h-28 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] flex items-center justify-center overflow-hidden">
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaUrl(current)} alt={label} className="max-h-24 object-contain" />
        ) : (
          <span className="text-sm text-[var(--color-text-muted)]">ยังไม่มีลายเซ็น</span>
        )}
      </div>
      <input type="file" accept="image/*" onChange={onFile} disabled={busy} className="text-sm" />
      {busy && <span className="text-xs text-[var(--color-text-muted)]">กำลังอัปโหลด…</span>}
    </div>
  );
}

export default function CertificateSettingsPage() {
  const [sig, setSig] = useState<Signatures>({ director: null, section_head: null });

  useEffect(() => {
    getCertSettings().then(setSig).catch(() => {});
  }, []);

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">ตั้งค่าใบประกาศ (ลายเซ็นออนไลน์)</h1>
        <p className="text-sm text-[var(--color-text-label)]">
          อัปโหลดรูปลายเซ็น (แนะนำ PNG พื้นหลังโปร่งใส) จะแสดงบนใบประกาศฯ ทุกใบ
        </p>
      </div>
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-6 border border-[var(--color-border)] shadow-[var(--shadow-sm)] grid grid-cols-1 md:grid-cols-2 gap-8">
        <SignatureBox which="section_head" label="ลายเซ็น หัวหน้าส่วน (ฝ่ายบทเรียนทางไปรษณีย์)" current={sig.section_head} onUploaded={setSig} />
        <SignatureBox which="director" label="ลายเซ็น ผู้อำนวยการ" current={sig.director} onUploaded={setSig} />
      </div>

      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-6 border border-[var(--color-border)] shadow-[var(--shadow-sm)]">
        <h2 className="text-lg font-bold text-[var(--color-primary)] mb-3">จัดตำแหน่งบนใบประกาศ (ลากวาง)</h2>
        <CertLayoutEditor signatures={sig} />
      </div>
    </div>
  );
}
