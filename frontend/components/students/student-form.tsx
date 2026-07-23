"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createStudent,
  getAmphures,
  getProfessions,
  getProvinces,
  getReligions,
  getTambons,
  nextCode,
  updateStudent,
  uploadTestimony,
  type Student,
} from "@/lib/students";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, FormField } from "@/components/ui/input";
import { htmlToLines, linesToHtml, rowsToServing, servingToRows } from "@/lib/richtext";

const inputCls =
  "w-full px-4 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]";

function calcAge(bday: string): string {
  const d = new Date(bday);
  if (isNaN(d.getTime()) || d.getFullYear() <= 1970) return "";
  const t = new Date();
  let a = t.getFullYear() - d.getFullYear();
  if (t.getMonth() < d.getMonth() || (t.getMonth() === d.getMonth() && t.getDate() < d.getDate())) a--;
  return String(a);
}

export function StudentForm({ student }: { student?: Student }) {
  const router = useRouter();
  const isEdit = !!student;
  const [form, setForm] = useState<Partial<Student>>(() =>
    student ? { ...student, note: htmlToLines(student.note) } : {},
  );
  // การรับใช้: แก้เป็นรายการแถว เพิ่ม/ลบได้ (เก็บกลับเป็น "1) …" ต่อบรรทัด)
  // เริ่มต้นอย่างน้อย 3 แถวเสมอ — แถวว่างจะถูกข้ามตอนบันทึก
  const [servingRows, setServingRows] = useState<string[]>(() => {
    const rows = student ? servingToRows(student.serving) : [];
    while (rows.length < 3) rows.push("");
    return rows;
  });

  const setRow = (i: number, v: string) =>
    setServingRows((rows) => rows.map((r, idx) => (idx === i ? v : r)));
  const addRow = () => setServingRows((rows) => [...rows, ""]);
  const deleteRow = (i: number) => setServingRows((rows) => rows.filter((_, idx) => idx !== i));
  const [provinces, setProvinces] = useState<string[]>([]);
  const [amphures, setAmphures] = useState<string[]>([]);
  const [tambons, setTambons] = useState<{ name_th: string; zip_code: number | null }[]>([]);
  const [professions, setProfessions] = useState<string[]>([]);
  const [religions, setReligions] = useState<{ short_name: string; name: string | null }[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = (k: keyof Student, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    getProvinces().then(setProvinces).catch(() => {});
    getProfessions().then(setProfessions).catch(() => {});
    getReligions().then(setReligions).catch(() => {});
    if (!isEdit) nextCode("individual").then((r) => set("registration_number", r.registration_number)).catch(() => {});
  }, [isEdit]);

  // load cascades for existing values (edit)
  useEffect(() => {
    if (form.province) getAmphures(form.province).then(setAmphures).catch(() => {});
    if (form.amphure) getTambons(form.amphure).then(setTambons).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onProvince(v: string) {
    setForm((f) => ({ ...f, province: v, amphure: "", tambon: "", zipcode: "" }));
    setAmphures([]);
    setTambons([]);
    if (v) getAmphures(v).then(setAmphures).catch(() => {});
  }
  function onAmphure(v: string) {
    setForm((f) => ({ ...f, amphure: v, tambon: "", zipcode: "" }));
    setTambons([]);
    if (v) getTambons(v).then(setTambons).catch(() => {});
  }
  function onTambon(v: string) {
    const t = tambons.find((x) => x.name_th === v);
    setForm((f) => ({ ...f, tambon: v, zipcode: t?.zip_code ? String(t.zip_code) : f.zipcode }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      const payload: Record<string, unknown> = {};
      Object.entries(form).forEach(([k, v]) => {
        payload[k] = v === "" ? null : v;
      });
      payload.serving = linesToHtml(rowsToServing(servingRows));
      payload.note = linesToHtml(form.note as string | null);
      let saved: Student;
      if (isEdit) {
        saved = await updateStudent(student!.id, payload);
      } else {
        saved = await createStudent(payload);
      }
      if (file) await uploadTestimony(saved.id, file);
      router.push("/post/students");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {err && (
        <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-error-surface)] border border-[var(--color-error)] text-[var(--color-error-dark)] text-sm">
          ⚠️ {err}
        </div>
      )}

      <section className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-6 border border-[var(--color-border)] shadow-[var(--shadow-sm)] grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField label="รหัสนักเรียน">
          <Input value={form.registration_number ?? ""} onChange={(e) => set("registration_number", e.target.value)} />
        </FormField>
        <FormField label="วันที่ลงทะเบียน">
          <Input type="date" value={form.registration_date ?? ""} onChange={(e) => set("registration_date", e.target.value)} />
        </FormField>
        <div />
        <FormField label="ชื่อ *">
          <Input value={form.first_name ?? ""} onChange={(e) => set("first_name", e.target.value)} required />
        </FormField>
        <FormField label="นามสกุล">
          <Input value={form.last_name ?? ""} onChange={(e) => set("last_name", e.target.value)} />
        </FormField>
        <FormField label="เพศ">
          <select className={inputCls} value={form.gender ?? ""} onChange={(e) => set("gender", e.target.value)}>
            <option value="">-</option>
            <option value="ช">ชาย</option>
            <option value="ญ">หญิง</option>
            <option value="ไม่ระบุ">ไม่ระบุ</option>
          </select>
        </FormField>
        <FormField label="วันเกิด">
          <Input type="date" value={form.birthday_date ?? ""} onChange={(e) => { set("birthday_date", e.target.value); set("age", calcAge(e.target.value)); }} />
        </FormField>
        <FormField label="อายุ">
          <Input value={form.age ?? ""} onChange={(e) => set("age", e.target.value)} />
        </FormField>
        <FormField label="อาชีพ">
          <input className={inputCls} list="professions" value={form.profession ?? ""} onChange={(e) => set("profession", e.target.value)} />
          <datalist id="professions">
            {[...new Set(professions)].map((p) => <option key={p} value={p} />)}
          </datalist>
        </FormField>
        <FormField label="ศาสนา">
          <select className={inputCls} value={form.religion ?? ""} onChange={(e) => set("religion", e.target.value)}>
            <option value="">-</option>
            {religions.map((r) => <option key={r.short_name} value={r.short_name}>{r.name}</option>)}
          </select>
        </FormField>
        <FormField label="เบอร์โทร">
          <Input value={form.phone_number ?? ""} onChange={(e) => set("phone_number", e.target.value)} />
        </FormField>
        <FormField label="รู้จักผ่านทาง">
          <Input value={form.program ?? ""} onChange={(e) => set("program", e.target.value)} />
        </FormField>
      </section>

      {/* address + geo cascade */}
      <section className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-6 border border-[var(--color-border)] shadow-[var(--shadow-sm)] grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField label="ที่อยู่">
          <Input value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} />
        </FormField>
        <FormField label="จังหวัด">
          <select className={inputCls} value={form.province ?? ""} onChange={(e) => onProvince(e.target.value)}>
            <option value="">-</option>
            {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </FormField>
        <FormField label="อำเภอ">
          <select className={inputCls} value={form.amphure ?? ""} onChange={(e) => onAmphure(e.target.value)} disabled={!amphures.length}>
            <option value="">-</option>
            {amphures.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </FormField>
        <FormField label="ตำบล">
          <select className={inputCls} value={form.tambon ?? ""} onChange={(e) => onTambon(e.target.value)} disabled={!tambons.length}>
            <option value="">-</option>
            {tambons.map((t) => <option key={t.name_th} value={t.name_th}>{t.name_th}</option>)}
          </select>
        </FormField>
        <FormField label="รหัสไปรษณีย์">
          <Input value={form.zipcode ?? ""} onChange={(e) => set("zipcode", e.target.value)} />
        </FormField>
        <FormField label="ชื่อคริสตจักร">
          <Input value={form.church_name ?? ""} onChange={(e) => set("church_name", e.target.value)} />
        </FormField>
      </section>

      {/* funnel dates + notes */}
      <section className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-6 border border-[var(--color-border)] shadow-[var(--shadow-sm)] grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField label="วันที่ส่งต่อคริสตจักร">
          <Input type="date" value={form.send_to_church_date ?? ""} onChange={(e) => set("send_to_church_date", e.target.value)} />
        </FormField>
        <FormField label="วันที่รับเชื่อ">
          <Input type="date" value={form.confession_date ?? ""} onChange={(e) => set("confession_date", e.target.value)} />
        </FormField>
        <FormField label="วันที่รับบัพติศมา">
          <Input type="date" value={form.baptism_date ?? ""} onChange={(e) => set("baptism_date", e.target.value)} />
        </FormField>
        <div className="md:col-span-3">
          <FormField label="การรับใช้">
            <div className="space-y-2">
              {servingRows.map((row, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-6 text-sm text-[var(--color-text-label)] text-right shrink-0">
                    {i + 1}.
                  </span>
                  <input
                    className={inputCls}
                    value={row}
                    placeholder="เช่น ทำงานแผนกบทเรียน FEBC"
                    onChange={(e) => setRow(i, e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="danger"
                    className="px-2.5 py-2 shrink-0"
                    onClick={() => deleteRow(i)}
                    title="ลบรายการนี้"
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="secondary" className="px-3 py-1.5" onClick={addRow}>
                <Plus size={15} /> เพิ่มรายการ
              </Button>
            </div>
          </FormField>
        </div>
        <div className="md:col-span-3">
          <FormField label="โน๊ต">
            <textarea className={inputCls} rows={2} value={form.note ?? ""} onChange={(e) => set("note", e.target.value)} />
          </FormField>
        </div>
      </section>

      {/* testimony */}
      <section className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-6 border border-[var(--color-border)] shadow-[var(--shadow-sm)] space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={!!form.has_testimony} onChange={(e) => set("has_testimony", e.target.checked)} className="w-5 h-5 accent-[var(--color-primary)]" />
          <span className="text-sm font-medium text-[var(--color-text-body)]">มีคำพยานแล้ว</span>
        </label>
        {form.has_testimony && (
          <FormField label="แนบไฟล์/รูปคำพยาน">
            <input type="file" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-sm" />
            {form.testimony_file && !file && (
              <a href={`${process.env.NEXT_PUBLIC_API_URL}/media/${form.testimony_file}`} target="_blank" className="text-xs text-[var(--color-primary)] underline">
                ดูไฟล์ปัจจุบัน
              </a>
            )}
          </FormField>
        )}
      </section>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving} className="px-8">
          {saving ? "กำลังบันทึก…" : "บันทึก"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/post/students")}>
          ยกเลิก
        </Button>
      </div>
    </form>
  );
}
