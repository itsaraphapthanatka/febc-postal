import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "draft" | "info" | "error" | "blessing";

const TONES: Record<Tone, { dot: string; bg: string; text: string }> = {
  success: { dot: "bg-[var(--color-success)]", bg: "bg-[var(--color-success-surface)]", text: "text-[var(--color-success-dark)]" },
  warning: { dot: "bg-[var(--color-warning)]", bg: "bg-[var(--color-warning-surface)]", text: "text-[#B45309]" },
  draft: { dot: "bg-[var(--color-text-muted)]", bg: "bg-slate-50", text: "text-[var(--color-text-label)]" },
  info: { dot: "bg-[var(--color-info)]", bg: "bg-[var(--color-info-surface)]", text: "text-[var(--color-info-dark)]" },
  error: { dot: "bg-[var(--color-error)]", bg: "bg-[var(--color-error-surface)]", text: "text-[var(--color-error-dark)]" },
  blessing: { dot: "bg-[var(--color-blessing)]", bg: "bg-[var(--color-blessing-surface)]", text: "text-[var(--color-blessing)]" },
};

export function StatusBadge({
  tone = "info",
  children,
}: {
  tone?: Tone;
  children: React.ReactNode;
}) {
  const t = TONES[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold text-xs",
        t.bg,
        t.text,
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", t.dot)} />
      {children}
    </span>
  );
}
