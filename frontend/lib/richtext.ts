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
