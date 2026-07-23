"use client";

import { mediaUrl, type CertLayout, type PrintData } from "@/lib/print";

const TH_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

export function thaiDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return `${d.getDate()} ${TH_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** สไตล์กลางของใบประกาศ A4 แนวนอน — ใส่ครั้งเดียวต่อหน้าเอกสาร */
export function CertStyle() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
      @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap');
      @page { size: A4 landscape; margin: 0; }
      html, body { margin: 0; padding: 0; }
      .cert { position: relative; width: 29.7cm; height: 21cm; font-family: 'Sarabun', sans-serif; overflow: hidden; }
      .cert img.bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: fill; }
      @media print {
        .cert { break-after: page; }
        .cert:last-child { break-after: auto; }
      }
      @media screen { body { background: #333; } .cert { margin: 16px auto; box-shadow: 0 0 20px rgba(0,0,0,.5); } }
    `,
      }}
    />
  );
}

/** ใบประกาศ 1 แผ่น (พื้นหลังตามชุดบทเรียน + ชื่อ/วันที่/ลายเซ็น overlay) */
export function CertSheet({ data, layout }: { data: PrintData; layout: CertLayout }) {
  const lessonId = data.plan?.post_lesson_id ?? 7;
  const imgNo = String(Math.max(1, lessonId - 6)).padStart(2, "0");
  const fullName = `${data.student.first_name ?? ""} ${data.student.last_name ?? ""}`.trim();
  const isPrisoner = (data.student.profession ?? "") === "นักโทษ";
  const longName = fullName.length > 24;

  const at = (p: { top: number; left: number }): React.CSSProperties => ({
    position: "absolute",
    top: `${p.top}%`,
    left: `${p.left}%`,
    transform: "translate(-50%, -50%)",
    textAlign: "center",
  });

  return (
    <div className="cert">
      <img className="bg" src={`/certificates/certificate_${imgNo}.png`} alt="certificate" />
      <div style={{ ...at(layout.name), color: "#000", fontSize: longName ? 38 : 46, fontWeight: 700 }}>
        {fullName}
      </div>
      <div style={{ ...at(layout.date), color: "#000", fontSize: 22 }}>{thaiDate(data.plan?.sent_date ?? null)}</div>
      {isPrisoner && (
        <div style={{ ...at(layout.hours), color: "#000", fontSize: 18 }}>จำนวนชั่วโมงการเรียน 30 ชั่วโมง</div>
      )}
      {data.signatures.section_head && (
        <img src={mediaUrl(data.signatures.section_head)} alt="section head"
          style={{ ...at(layout.section_head), height: "1.3cm", maxWidth: 200, objectFit: "contain" }} />
      )}
      {data.signatures.director && (
        <img src={mediaUrl(data.signatures.director)} alt="director"
          style={{ ...at(layout.director), height: "1.3cm", maxWidth: 200, objectFit: "contain" }} />
      )}
    </div>
  );
}
