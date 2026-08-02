import type { InputHTMLAttributes } from "react";

export default function Input({
  className = "",
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`h-12 w-full rounded-[var(--radius-sm)] border border-border bg-surface px-4 text-[0.95rem] text-foreground placeholder:text-foreground-muted/70 outline-none transition-colors focus:border-primary focus:ring-4 focus:ring-primary-tint ${className}`}
      {...rest}
    />
  );
}
