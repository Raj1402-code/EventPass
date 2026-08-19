import React from 'react';
import { clsx } from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'dark' | 'hover';
}

export const Card: React.FC<CardProps> = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  const base = 'rounded-xl border transition-all duration-300 overflow-hidden';

  const variants = {
    default: 'bg-white border-gray-200 shadow-md hover:shadow-lg',
    glass: 'glass-panel shadow-lg border-white/40',
    dark: 'dark-glass-panel text-white border-gray-800 shadow-2xl',
    hover: 'bg-white border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#006D77]/40',
  };

  return (
    <div className={clsx(base, variants[variant], className)} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={clsx('p-6 pb-3 border-b border-gray-100 dark:border-gray-800', className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => (
  <h3 className={clsx('text-xl font-bold text-gray-900 dark:text-white tracking-tight', className)} {...props}>
    {children}
  </h3>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={clsx('p-6', className)} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={clsx('p-6 pt-3 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800', className)} {...props}>
    {children}
  </div>
);
