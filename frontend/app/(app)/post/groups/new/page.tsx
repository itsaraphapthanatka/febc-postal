"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import {
  createDriver,
  createGroup,
  createTeacher,
  listDrivers,
  listTeachers,
  type Driver,
  type GroupStudentInput,
  type Teacher,
} from "@/lib/groups";
import { Button } from "@/components/ui/button";
import { Input, FormField } from "@/components/ui/input";

const YEAR = new Date();
const TODAY = `${YEAR.getFullYear()}-${String(YEAR.getMonth() + 1).padStart(2, "0")}-${String(YEAR.getDate()).padStart(2, "0")}`;
const sel =
  "w-full px-3 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]";

export default function NewGroupPage() {
  const router = useRouter();
  const [type, setType] = useState<"driver" | "network">("driver");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [teacherId, setTeacherId] = useState<number | "">("");
  const [driverId, setDriverId] = useState<number | "">("");
  const [churchName, setChurchName] = useState("");
  const [regDate, setRegDate] = useState(TODAY);
  const [students, setStudents] = useState<GroupStudentInput[]>([{ first_name: "" }]);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // inline create — teacher
  const [showNewTeacher, setShowNewTeacher] = useState(false);
  const [nt, setNt] = useState<Partial<Teacher>>({});
  // inline create — driver
  const [showNewDriver, setShowNewDriver] = useState(false);
  const [nd, setNd] = useState<Partial<Driver>>({});

  useEffect(() => {
    listTeachers().then(setTeachers).catch(() => {});
    listDrivers().then(setDrivers).catch(() => {});
  }, []);

  async function saveNewTeacher() {
    if (!nt.first_name) return;
    const t = await createTeacher(nt);
    setTeachers((ts) => [...ts, t]);
    setTeacherId(t.id);
    setShowNewTeacher(false);
    setNt({});
  }
  async function saveNewDriver() {
    if (!nd.name) return;
    const d = await createDriver(nd);
    setDrivers((ds) => [...ds, d]);
    setDriverId(d.id);
    setShowNewDriver(false);
    setNd({});
  }

  const setStu = (i: number, k: keyof GroupStudentInput, v: string) =>
    setStudents((rs) => rs.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!teacherId) return setErr("กรุณาเลือกหรือสร้างครูผู้สอน");
    if (type === "driver" && !driverId) return setErr("กรุณาเลือกหรือสร้างผู้ขับเคลื่อน");
    const valid = students.filter((s) => s.first_name.trim());
    if (!valid.length) return setErr("กรุณากรอกรายชื่อผู้เรียนอย่างน้อย 1 คน");
    setSaving(true);
    try {
      await createGroup({
        type,
        post_teacher_id: Number(teacherId),
        post_driver_id: type === "driver" ? Number(driverId) : null,
        church_name: churchName || null,
        registration_date: regDate,
        students: valid,
      });
      router.push("/post/groups");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-bold text-[var(--color-primary)]">สมัครเรียนแบบกลุ่ม</h1>
      {err && (
        <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-error-surface)] border border-[var(--color-error)] text-[var(--color-error-dark)] text-sm">⚠️ {err}</div>
      )}

      {/* group info */}
      <section className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-6 border border-[var(--color-border)] shadow-[var(--shadow-sm)] space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="ประเภทการสมัคร">
            <select className={sel} value={type} onChange={(e) => setType(e.target.value as "driver" | "network")}>
              <option value="driver">มีผู้ขับเคลื่อน + ครูผู้สอน (รหัสเดิม)</option>
              <option value="network">แม่ข่าย (รหัสใหม่ MM0001/ปี)</option>
            </select>
          </FormField>
          <FormField label="วันที่ลงทะเบียน">
            <Input type="date" value={regDate} onChange={(e) => setRegDate(e.target.value)} />
          </FormField>
        </div>

        {type === "driver" && (
          <FormField label="ผู้ขับเคลื่อน">
            <div className="flex gap-2">
              <select className={sel} value={driverId} onChange={(e) => setDriverId(e.target.value ? Number(e.target.value) : "")}>
                <option value="">- เลือกผู้ขับเคลื่อน -</option>
                {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <Button type="button" variant="secondary" onClick={() => setShowNewDriver((v) => !v)}>＋ ใหม่</Button>
            </div>
            {showNewDriver && (
              <div className="mt-2 flex gap-2 items-end">
                <Input placeholder="ชื่อผู้ขับเคลื่อน" value={nd.name ?? ""} onChange={(e) => setNd({ ...nd, name: e.target.value })} />
                <Input placeholder="เบอร์โทร" value={nd.phone_number ?? ""} onChange={(e) => setNd({ ...nd, phone_number: e.target.value })} />
                <Button type="button" onClick={saveNewDriver}>บันทึก</Button>
              </div>
            )}
          </FormField>
        )}

        <FormField label="ครูผู้สอน (ที่อยู่ครูใช้เป็นที่อยู่จัดส่งของกลุ่ม)">
          <div className="flex gap-2">
            <select className={sel} value={teacherId} onChange={(e) => setTeacherId(e.target.value ? Number(e.target.value) : "")}>
              <option value="">- เลือกครูผู้สอน -</option>
              {teachers.map((t) => <option key={t.id} value={t.id}>{t.first_name} {t.last_name ?? ""}</option>)}
            </select>
            <Button type="button" variant="secondary" onClick={() => setShowNewTeacher((v) => !v)}>＋ ใหม่</Button>
          </div>
          {showNewTeacher && (
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
              <Input placeholder="ชื่อ" value={nt.first_name ?? ""} onChange={(e) => setNt({ ...nt, first_name: e.target.value })} />
              <Input placeholder="นามสกุล" value={nt.last_name ?? ""} onChange={(e) => setNt({ ...nt, last_name: e.target.value })} />
              <Input placeholder="เบอร์ติดต่อ" value={nt.phone_number ?? ""} onChange={(e) => setNt({ ...nt, phone_number: e.target.value })} />
              <Input placeholder="ที่อยู่จัดส่ง" value={nt.address ?? ""} onChange={(e) => setNt({ ...nt, address: e.target.value })} />
              <Input placeholder="ตำบล" value={nt.tambon ?? ""} onChange={(e) => setNt({ ...nt, tambon: e.target.value })} />
              <Input placeholder="อำเภอ" value={nt.amphure ?? ""} onChange={(e) => setNt({ ...nt, amphure: e.target.value })} />
              <Input placeholder="จังหวัด" value={nt.province ?? ""} onChange={(e) => setNt({ ...nt, province: e.target.value })} />
              <Input placeholder="รหัสไปรษณีย์" value={nt.zipcode ?? ""} onChange={(e) => setNt({ ...nt, zipcode: e.target.value })} />
              <div className="md:col-span-2">
                <Button type="button" onClick={saveNewTeacher}>บันทึกครู</Button>
              </div>
            </div>
          )}
        </FormField>

        <FormField label="ชื่อคริสตจักร / โรงเรียน / มูลนิธิ">
          <Input value={churchName} onChange={(e) => setChurchName(e.target.value)} />
        </FormField>
      </section>

      {/* students repeater */}
      <section className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-6 border border-[var(--color-border)] shadow-[var(--shadow-sm)] space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[var(--color-primary)]">รายชื่อผู้เรียน</h3>
          <span className="text-xs text-[var(--color-text-muted)]">ระบบจะรันรหัสให้อัตโนมัติเมื่อบันทึก</span>
        </div>
        {students.map((s, i) => (
          <div key={i} className="flex gap-2 items-center">
            <span className="text-sm text-[var(--color-text-muted)] w-6">{i + 1}.</span>
            <Input placeholder="ชื่อ" value={s.first_name} onChange={(e) => setStu(i, "first_name", e.target.value)} />
            <Input placeholder="นามสกุล" value={s.last_name ?? ""} onChange={(e) => setStu(i, "last_name", e.target.value)} />
            <select className={sel} value={s.gender ?? ""} onChange={(e) => setStu(i, "gender", e.target.value)}>
              <option value="">เพศ</option>
              <option value="ช">ชาย</option>
              <option value="ญ">หญิง</option>
              <option value="ไม่ระบุ">ไม่ระบุ</option>
            </select>
            <Input placeholder="เบอร์โทร" value={s.phone_number ?? ""} onChange={(e) => setStu(i, "phone_number", e.target.value)} />
            <Button type="button" variant="danger" className="px-2 py-2" onClick={() => setStudents((rs) => rs.filter((_, idx) => idx !== i))} disabled={students.length === 1}>
              <Trash2 size={14} />
            </Button>
          </div>
        ))}
        <Button type="button" variant="secondary" onClick={() => setStudents((rs) => [...rs, { first_name: "" }])}>
          <Plus size={14} /> เพิ่มผู้เรียน
        </Button>
      </section>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving} className="px-8">{saving ? "กำลังบันทึก…" : "บันทึกกลุ่ม"}</Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/post/groups")}>ยกเลิก</Button>
      </div>
    </form>
  );
}
