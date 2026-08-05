import Link from "next/link";
import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 text-center rounded-[var(--radius-sm)] font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  secondary:
    "bg-surface text-foreground border border-border hover:border-foreground/30",
  ghost: "text-foreground hover:bg-surface-alt",
};

// min-h (not h-*) + vertical padding, so a button whose text wraps onto a
// second line on narrow screens grows to fit it instead of clipping it.
const sizes: Record<Size, string> = {
  md: "min-h-11 px-5 py-2.5 text-[0.95rem]",
  lg: "min-h-13 px-7 py-3 text-base",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
}

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "className" | "children"
>;

interface ButtonAsButton extends CommonProps, NativeButtonProps {
  href?: undefined;
}

interface ButtonAsLink extends CommonProps {
  href: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

export default function Button(props: ButtonAsButton | ButtonAsLink) {
  if ("href" in props && props.href) {
    const { variant = "primary", size = "md", children, className = "", href, onClick } = props;
    const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }

  const {
    variant = "primary",
    size = "md",
    children,
    className = "",
    ...rest
  } = props as ButtonAsButton;
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
