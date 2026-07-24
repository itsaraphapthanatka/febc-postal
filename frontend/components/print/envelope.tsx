export const FEBC_ADDRESS = [
  "ผู้ประกาศข่าวประเสริฐ",
  "ตู้ ปณ.24 พระโขนง",
  "กรุงเทพฯ 10110",
];

export function studentAddress(s: {
  first_name: string | null;
  last_name: string | null;
  address: string | null;
  tambon: string | null;
  amphure: string | null;
  province: string | null;
  zipcode: string | null;
}): string[] {
  return [
    `คุณ ${s.first_name ?? ""} ${s.last_name ?? ""}`.trim(),
    s.address ? `ที่อยู่: ${s.address}` : "",
    [s.tambon ? `ต.${s.tambon}` : "", s.amphure ? `อ.${s.amphure}` : ""].filter(Boolean).join(" "),
    [s.province ? `จ.${s.province}` : "", s.zipcode ?? ""].filter(Boolean).join(" "),
  ].filter(Boolean);
}

export function Envelope({
  sender,
  recipient,
  lessonTitles,
  regNumber,
}: {
  sender: string[];
  recipient: string[];
  lessonTitles?: (string | null | undefined)[];
  regNumber?: string | null;
}) {
  const lessons = (lessonTitles ?? []).filter((t): t is string => Boolean(t));
  return (
    <div className="flex flex-col justify-between" style={{ minHeight: "14cm" }}>
      {/* sender — top left */}
      <div style={{ fontSize: 20, lineHeight: 1.5 }}>
        {sender.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>

      {/* middle: lesson (left) + recipient (right) */}
      <div className="flex justify-between items-end gap-8" style={{ marginTop: "1.5cm" }}>
        <div style={{ fontSize: 16, width: "35%" }}>
          {lessons.length > 0 && (
            <>
              <div
                style={{
                  fontWeight: 600,
                  display: "inline-block",
                  border: "1px solid currentColor",
                  padding: "1px 8px",
                }}
              >
                บทเรียน:BCC
              </div>
              {lessons.length === 1 ? (
                <div style={{ marginTop: 6 }}>{lessons[0]}</div>
              ) : (
                <ul style={{ margin: "6px 0 0", paddingLeft: "1.1em", listStyle: "disc" }}>
                  {lessons.map((t, i) => (
                    <li key={i} style={{ lineHeight: 1.5 }}>{t}</li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
        <div style={{ fontSize: 26, lineHeight: 1.55, width: "60%" }}>
          {recipient.map((l, i) => (
            <div key={i} style={i === 0 ? { fontWeight: 700 } : undefined}>
              {l}
            </div>
          ))}
        </div>
      </div>

      {/* footer verse */}
      <div style={{ textAlign: "center", fontSize: 15, marginTop: "1.5cm" }}>
        พระวจนะของพระองค์เป็นตะเกียงแก่เท้าของข้าพระองค์และเป็นความสว่างแก่ทางของข้าพระองค์
        (สดุดี 119:105)
      </div>

      {/* print text */}
      <div className="flex justify-between" style={{ fontSize: 16, marginTop: "0.5cm" }}>
        <span>สิ่งตีพิมพ์</span>
        {regNumber && <span>รหัส {regNumber}</span>}
      </div>
    </div>
  );
}
