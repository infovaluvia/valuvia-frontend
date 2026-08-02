import type { HTMLAttributes } from "react";

export default function Card({
  className = "",
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-[var(--radius-lg)] border border-border bg-surface ${className}`}
      {...rest}
    />
  );
}
