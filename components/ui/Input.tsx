import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = "", ...rest }, ref) {
    return (
      <input
        ref={ref}
        className={`h-12 w-full rounded-[var(--radius-sm)] border border-border bg-surface px-4 text-[0.95rem] text-foreground placeholder:text-foreground-muted/70 outline-none transition-colors focus:border-primary focus:ring-4 focus:ring-primary-tint ${className}`}
        {...rest}
      />
    );
  }
);

export default Input;
