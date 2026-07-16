"use client";

import { useEffect, useRef, useState } from "react";
import {
  getCertLayout,
  mediaUrl,
  saveCertLayout,
  type CertLayout,
  type Pos,
  type Signatures,
} from "@/lib/print";
import { Button } from "@/components/ui/button";

const clamp = (n: number) => Math.max(2, Math.min(98, n));

type Key = keyof CertLayout;

const LABELS: Record<Key, string> = {
  name: "ชื่อนักเรียน",
  date: "วันที่",
  hours: "30 ชม. (นักโทษ)",
  section_head: "ลายเซ็นหัวหน้าส่วน",
  director: "ลายเซ็นผู้อำนวยการ",
};

export function CertLayoutEditor({ signatures }: { signatures: Signatures }) {
  const [layout, setLayout] = useState<CertLayout | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<Key | null>(null);

  useEffect(() => {
    getCertLayout().then(setLayout).catch(() => {});
  }, []);

  function onPointerDown(key: Key) {
    return (e: React.PointerEvent) => {
      e.preventDefault();
      dragging.current = key;
      const move = (ev: PointerEvent) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect || dragging.current !== key) return;
        const left = clamp(((ev.clientX - rect.left) / rect.width) * 100);
        const top = clamp(((ev.clientY - rect.top) / rect.height) * 100);
        setLayout((l) => (l ? { ...l, [key]: { top: Math.round(top), left: Math.round(left) } } : l));
        setSaved(false);
      };
      const up = () => {
        dragging.current = null;
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    };
  }

  async function save() {
    if (!layout) return;
    setSaving(true);
    try {
      await saveCertLayout(layout);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  if (!layout) return <p className="text-sm text-[var(--color-text-muted)]">กำลังโหลด…</p>;

  const item = (key: Key, node: React.ReactNode) => {
    const pos: Pos = layout[key];
    return (
      <div
        key={key}
        onPointerDown={onPointerDown(key)}
        style={{
          position: "absolute",
          top: `${pos.top}%`,
          left: `${pos.left}%`,
          transform: "translate(-50%, -50%)",
          cursor: "move",
          touchAction: "none",
          whiteSpace: "nowrap",
        }}
        className="select-none ring-1 ring-dashed ring-[var(--color-primary)]/50 rounded px-1 hover:ring-2 hover:ring-[var(--color-primary)] bg-white/40"
        title={`${LABELS[key]} — ลากเพื่อย้าย`}
      >
        {node}
      </div>
    );
  };

  const sigNode = (path: string | null, label: string) =>
    path ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={mediaUrl(path)} alt={label} style={{ height: 34, objectFit: "contain" }} />
    ) : (
      <span className="text-[10px] text-[var(--color-primary)] font-semibold">[{label}]</span>
    );

  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--color-text-label)]">
        ลากชื่อ / วันที่ / ลายเซ็น ไปวางตำแหน่งที่ต้องการบนใบประกาศ แล้วกด “บันทึกตำแหน่ง”
      </p>
      <div
        ref={containerRef}
        className="relative w-full mx-auto border border-[var(--color-border)] rounded-[var(--radius-md)] overflow-hidden"
        style={{ maxWidth: 820, aspectRatio: "1.414 / 1" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/certificates/certificate_01.png" alt="certificate" className="absolute inset-0 w-full h-full object-fill" />
        {item("name", <span className="text-[var(--color-primary-dark)] font-bold text-lg">พิชชาพา ยูริ</span>)}
        {item("date", <span className="text-black text-sm">15 กรกฎาคม 2026</span>)}
        {item("hours", <span className="text-black text-xs">จำนวนชั่วโมงการเรียน 30 ชั่วโมง</span>)}
        {item("section_head", sigNode(signatures.section_head, "ลายเซ็นหัวหน้าส่วน"))}
        {item("director", sigNode(signatures.director, "ลายเซ็นผู้อำนวยการ"))}
      </div>
      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={saving}>{saving ? "กำลังบันทึก…" : "บันทึกตำแหน่ง"}</Button>
        {saved && <span className="text-sm text-[var(--color-success-dark)]">✓ บันทึกตำแหน่งแล้ว</span>}
        <span className="text-xs text-[var(--color-text-muted)]">
          ชื่อ {layout.name.top}%/{layout.name.left}% · ลายเซ็น ผอ. {layout.director.top}%/{layout.director.left}%
        </span>
      </div>
    </div>
  );
}
