import React from 'react';
import { clsx } from 'clsx';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'outline';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'primary',
  size = 'md',
  children,
  ...props
}) => {
  const base = 'inline-flex items-center font-semibold rounded-full tracking-wide';

  const variants = {
    primary: 'bg-[#006D77]/10 text-[#006D77] border border-[#006D77]/20',
    secondary: 'bg-[#83C5BE]/20 text-[#004D55] border border-[#83C5BE]/40',
    accent: 'bg-[#E29578]/15 text-[#D17E5F] border border-[#E29578]/30',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400',
    error: 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-400',
    outline: 'border border-gray-300 text-gray-700 dark:text-gray-300',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs sm:text-sm',
  };

  return (
    <span className={clsx(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
};
