/** แปลงค่า rich text จาก Laravel (<p>1) ...</p><p>2) ...</p>) ↔ ข้อความหลายบรรทัด
 *
 * ระบบเดิมเก็บ serving/note เป็น HTML — แสดงใน textarea เป็นบรรทัดธรรมดา
 * และห่อกลับเป็น <p> ตอนบันทึก เพื่อให้ฝั่ง Laravel ยังแสดงผลถูกระหว่างรันคู่กัน
 */

const ENTITIES: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
};

export function htmlToLines(value: string | null | undefined): string {
  if (!value) return "";
  if (!/<[a-z][^>]*>/i.test(value)) return value;
  let text = value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li)>/gi, "\n")
    .replace(/<[^>]+>/g, "");
  text = text.replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;/g, (m) => ENTITIES[m] ?? m);
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .join("\n");
}

/** แตกค่าการรับใช้เป็นรายการแถว — ตัดเลขนำหน้าเดิม (1) / 1. / 1-) ออก ให้เหลือแต่เนื้อหา */
export function servingToRows(value: string | null | undefined): string[] {
  return htmlToLines(value)
    .split("\n")
    .map((l) => l.replace(/^\s*\d+\s*[).\-]\s*/, "").trim())
    .filter(Boolean);
}

/** รวมแถวกลับเป็นข้อความใส่เลขข้อ "1) …" ต่อบรรทัด (รูปแบบเดียวกับข้อมูลเดิม) */
export function rowsToServing(rows: string[]): string {
  return rows
    .map((r) => r.trim())
    .filter(Boolean)
    .map((r, i) => `${i + 1}) ${r}`)
    .join("\n");
}

export function linesToHtml(value: string | null | undefined): string | null {
  if (!value || !value.trim()) return null;
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return value
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => `<p>${esc(l)}</p>`)
    .join("");
}
