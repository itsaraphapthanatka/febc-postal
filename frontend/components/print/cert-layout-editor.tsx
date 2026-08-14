"use client";

import { useEffect, useRef, useState } from "react";
import {
  CERT_FONTS,
  CERT_FONT_FALLBACK,
  CERT_FONT_IMPORT_CSS,
  CERT_ITEM_KEYS,
  CERT_SHEET_W,
  CERT_SIZE_MAX,
  CERT_SIZE_MIN,
  getCertLayout,
  isCertFont,
  mediaUrl,
  saveCertLayout,
  type CertFont,
  type CertItemKey,
  type CertLayout,
  type Signatures,
} from "@/lib/print";
import { Button } from "@/components/ui/button";

const clampPct = (n: number) => Math.max(2, Math.min(98, n));
const clampSize = (n: number) => Math.max(CERT_SIZE_MIN, Math.min(CERT_SIZE_MAX, n));

const LABELS: Record<CertItemKey, string> = {
  name: "ชื่อนักเรียน",
  date: "วันที่",
  hours: "30 ชม. (นักโทษ)",
  section_head: "ลายเซ็นหัวหน้าส่วน",
  director: "ลายเซ็นผู้อำนวยการ",
};

/** ลายเซ็นปรับ "ความสูงรูป" ไม่ใช่ font-size — ใช้แยกข้อความช่วยในหน้าจอ */
const IS_IMAGE: Record<CertItemKey, boolean> = {
  name: false,
  date: false,
  hours: false,
  section_head: true,
  director: true,
};

/** โหลดฟอนต์ที่เลือกได้ให้พรีวิวเห็นตรงกับใบพิมพ์จริง (สตริงคงที่) */
function PreviewFonts() {
  return <style dangerouslySetInnerHTML={{ __html: CERT_FONT_IMPORT_CSS }} />;
}

export function CertLayoutEditor({ signatures }: { signatures: Signatures }) {
  const [layout, setLayout] = useState<CertLayout | null>(null);
  const [selected, setSelected] = useState<CertItemKey>("name");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<CertItemKey | null>(null);
  // ความกว้างพรีวิวจริงบนจอ ใช้คิดสเกลเทียบใบ A4 → พรีวิวเป็น WYSIWYG
  const [previewW, setPreviewW] = useState(0);

  useEffect(() => {
    getCertLayout().then(setLayout).catch(() => {});
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setPreviewW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [layout]);

  function onPointerDown(key: CertItemKey) {
    return (e: React.PointerEvent) => {
      e.preventDefault();
      setSelected(key);
      dragging.current = key;
      const move = (ev: PointerEvent) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect || dragging.current !== key) return;
        const left = clampPct(((ev.clientX - rect.left) / rect.width) * 100);
        const top = clampPct(((ev.clientY - rect.top) / rect.height) * 100);
        setLayout((l) =>
          l ? { ...l, [key]: { ...l[key], top: Math.round(top), left: Math.round(left) } } : l,
        );
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

  function bumpSize(key: CertItemKey, delta: number) {
    setLayout((l) =>
      l ? { ...l, [key]: { ...l[key], size: clampSize(l[key].size + delta) } } : l,
    );
    setSaved(false);
  }

  function setFont(font: CertFont) {
    setLayout((l) => (l ? { ...l, font } : l));
    setSaved(false);
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

  const font = isCertFont(layout.font) ? layout.font : CERT_FONT_FALLBACK;
  // px บนใบจริง → px บนพรีวิว (ก่อนวัดความกว้างได้ ใช้ 1 ไปก่อนกันข้อความกระพริบ)
  const scale = previewW > 0 ? previewW / CERT_SHEET_W : 1;
  const scaled = (size: number) => Math.max(1, size * scale);

  const item = (key: CertItemKey, node: React.ReactNode) => (
    <div
      key={key}
      onPointerDown={onPointerDown(key)}
      style={{
        position: "absolute",
        top: `${layout[key].top}%`,
        left: `${layout[key].left}%`,
        transform: "translate(-50%, -50%)",
        cursor: "move",
        touchAction: "none",
        whiteSpace: "nowrap",
      }}
      className={`select-none rounded px-1 bg-white/40 ${
        selected === key
          ? "ring-2 ring-[var(--color-primary)]"
          : "ring-1 ring-dashed ring-[var(--color-primary)]/50 hover:ring-2 hover:ring-[var(--color-primary)]"
      }`}
      title={`${LABELS[key]} — ลากเพื่อย้าย / คลิกเพื่อเลือกแล้วปรับขนาด`}
    >
      {node}
    </div>
  );

  const textNode = (key: CertItemKey, text: string, bold = false) => (
    <span
      style={{
        fontFamily: `'${font}', sans-serif`,
        fontSize: scaled(layout[key].size),
        fontWeight: bold ? 700 : 400,
        color: "#000",
        lineHeight: 1.15,
      }}
    >
      {text}
    </span>
  );

  const sigNode = (key: CertItemKey, path: string | null, label: string) =>
    path ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={mediaUrl(path)}
        alt={label}
        style={{ height: scaled(layout[key].size), maxWidth: scaled(200), objectFit: "contain" }}
      />
    ) : (
      <span
        className="text-[var(--color-primary)] font-semibold"
        style={{ fontSize: Math.max(9, scaled(layout[key].size) * 0.4) }}
      >
        [{label}]
      </span>
    );

  const sel = layout[selected];

  return (
    <div className="space-y-3">
      <PreviewFonts />
      <p className="text-sm text-[var(--color-text-label)]">
        ลากชื่อ / วันที่ / ลายเซ็น ไปวางตำแหน่งที่ต้องการ · คลิกเลือกแล้วปรับขนาดด้านล่าง ·
        พรีวิวย่อตามสัดส่วนใบจริง (A4 แนวนอน) เห็นเท่าที่พิมพ์ออกมา
      </p>

      {/* แถบควบคุม: เลือกฟอนต์ (ทั้งใบ) + ปรับขนาดของ element ที่เลือก */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-[var(--color-text-label)]">ฟอนต์ทั้งใบ</span>
          <select
            value={font}
            onChange={(e) => setFont(e.target.value as CertFont)}
            className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-sm"
            style={{ fontFamily: `'${font}', sans-serif` }}
          >
            {CERT_FONTS.map((f) => (
              <option key={f} value={f} style={{ fontFamily: `'${f}', sans-serif` }}>
                {f}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-2 text-sm">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value as CertItemKey)}
            className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-sm"
          >
            {CERT_ITEM_KEYS.map((k) => (
              <option key={k} value={k}>
                {LABELS[k]}
              </option>
            ))}
          </select>
          <span className="text-[var(--color-text-label)]">
            {IS_IMAGE[selected] ? "ความสูง" : "ขนาดฟอนต์"}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => bumpSize(selected, -1)}
              disabled={sel.size <= CERT_SIZE_MIN}
              aria-label="ลดขนาด"
              className="h-7 w-7 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] text-base leading-none disabled:opacity-40"
            >
              −
            </button>
            <span className="w-14 text-center tabular-nums font-medium">{sel.size} px</span>
            <button
              type="button"
              onClick={() => bumpSize(selected, 1)}
              disabled={sel.size >= CERT_SIZE_MAX}
              aria-label="เพิ่มขนาด"
              className="h-7 w-7 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] text-base leading-none disabled:opacity-40"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative w-full mx-auto border border-[var(--color-border)] rounded-[var(--radius-md)] overflow-hidden"
        style={{ maxWidth: 820, aspectRatio: "1.414 / 1" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/certificates/certificate_01.png" alt="certificate" className="absolute inset-0 w-full h-full object-fill" />
        {item("name", textNode("name", "พิชชาพา ยูริ", true))}
        {item("date", textNode("date", "15 กรกฎาคม 2026"))}
        {item("hours", textNode("hours", "จำนวนชั่วโมงการเรียน 30 ชั่วโมง"))}
        {item("section_head", sigNode("section_head", signatures.section_head, "ลายเซ็นหัวหน้าส่วน"))}
        {item("director", sigNode("director", signatures.director, "ลายเซ็นผู้อำนวยการ"))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={save} disabled={saving}>{saving ? "กำลังบันทึก…" : "บันทึกตำแหน่ง"}</Button>
        {saved && <span className="text-sm text-[var(--color-success-dark)]">✓ บันทึกแล้ว</span>}
        <span className="text-xs text-[var(--color-text-muted)]">
          {LABELS[selected]} · {layout[selected].top}%/{layout[selected].left}% · {sel.size}px · ฟอนต์ {font}
        </span>
      </div>
    </div>
  );
}
