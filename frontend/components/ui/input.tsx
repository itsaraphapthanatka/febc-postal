import { InputHTMLAttributes, forwardRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full px-4 py-3 rounded-[var(--radius-md)] border border-[var(--color-border)]",
        "bg-[var(--color-bg)] text-[var(--color-text-body)] text-sm",
        "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]",
        "transition-colors placeholder:text-[var(--color-text-muted)]",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export function FormField({
  label,
  htmlFor,
  children,
  error,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-[var(--color-text-label)]"
      >
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-[var(--color-error-dark)]">{error}</p>}
    </div>
  );
}
