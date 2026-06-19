import type { ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const variantStyles: Record<Variant, string> = {
  primary: "bg-[var(--ja-purple)] hover:bg-[var(--ja-purple-hover)] text-white shadow-[var(--ja-shadow-glow)]",
  secondary: "bg-white/10 hover:bg-white/15 text-white border border-[var(--ja-border)]",
  ghost: "bg-transparent hover:bg-white/5 text-[var(--ja-text-secondary)] hover:text-white",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3 text-base",
};

const base = "inline-flex items-center justify-center gap-2 font-medium rounded-[var(--ja-r-md)] transition-all duration-[var(--ja-normal)] ease-[var(--ja-ease-out)] hover:scale-[1.03] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-[var(--ja-purple)] focus-visible:outline-offset-2";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: Variant;
  size?: Size;
  href: string;
  children: ReactNode;
}

export function Button({ variant = "primary", size = "md", className = "", children, ...rest }: ButtonProps) {
  return (
    <button className={`${base} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function LinkButton({ variant = "primary", size = "md", href, className = "", children, ...rest }: LinkButtonProps) {
  return (
    <Link href={href} className={`${base} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`} {...rest}>
      {children}
    </Link>
  );
}
