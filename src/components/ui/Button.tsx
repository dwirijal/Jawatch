import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type ButtonVariant = 'default' | 'ghost';

export function buttonClasses(variant: ButtonVariant = 'default', className?: string): string {
  const variants = {
    default: 'border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground',
    ghost: 'border-border text-foreground bg-transparent hover:border-foreground',
  };

  return cn(
    // ponytail: px-[26px] py-[13px] = pad.button; literal because two-value token can't be single class
    'inline-flex cursor-pointer items-center justify-center border px-[26px] py-[13px] font-mono text-xs uppercase tracking-xs transition-[color,background-color,border-color,transform] duration-150 motion-safe:active:scale-[0.97] motion-reduce:active:scale-100 disabled:cursor-not-allowed disabled:opacity-40',
    variants[variant],
    className,
  );
}

export function Button({
  children,
  className,
  variant = 'default',
  type = 'button',
  ...props
}: {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={buttonClasses(variant, className)} type={type} {...props}>
      {children}
    </button>
  );
}
