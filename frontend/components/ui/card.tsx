import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-6 border border-[var(--color-border)]",
        "shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-lg font-bold text-[var(--color-primary)] mb-4",
        className,
      )}
      {...props}
    />
  );
}
