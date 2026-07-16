import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "accent" | "success" | "info" | "blessing";

const TILE: Record<Variant, string> = {
  primary: "bg-[var(--color-primary)]",
  accent: "bg-[var(--color-accent)]",
  success: "bg-[var(--color-success)]",
  info: "bg-[var(--color-info)]",
  blessing: "bg-[var(--color-blessing)]",
};

const VALUE: Record<Variant, string> = {
  primary: "text-[var(--color-primary-dark)]",
  accent: "text-[var(--color-accent-dark)]",
  success: "text-[var(--color-success-dark)]",
  info: "text-[var(--color-info-dark)]",
  blessing: "text-[var(--color-blessing)]",
};

export function StatsCard({
  emoji,
  value,
  label,
  variant = "primary",
  badge,
}: {
  emoji: string;
  value: ReactNode;
  label: string;
  variant?: Variant;
  badge?: ReactNode;
}) {
  return (
    <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-5 border border-[var(--color-border)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow">
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "w-11 h-11 rounded-[var(--radius-md)] flex items-center justify-center",
            TILE[variant],
          )}
        >
          <span className="text-white text-xl">{emoji}</span>
        </div>
        {badge && (
          <span className="text-xs font-semibold px-2 py-1 rounded-[var(--radius-full)] bg-[var(--color-success-surface)] text-[var(--color-success-dark)]">
            {badge}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className={cn("text-2xl font-bold", VALUE[variant])}>{value}</p>
        <p className="text-sm text-[var(--color-text-label)] mt-1">{label}</p>
      </div>
    </div>
  );
}
