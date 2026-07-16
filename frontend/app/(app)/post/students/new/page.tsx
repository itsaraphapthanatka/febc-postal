import { StudentForm } from "@/components/students/student-form";

export default function NewStudentPage() {
  return (
    <div className="space-y-5 max-w-6xl">
      <h1 className="text-2xl font-bold text-[var(--color-primary)]">สร้างนักเรียนใหม่</h1>
      <StudentForm />
    </div>
  );
}
