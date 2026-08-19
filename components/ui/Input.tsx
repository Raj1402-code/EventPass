import React from 'react';
import { clsx } from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
            {label}
          </label>
        )}
        <div className="relative rounded-lg shadow-sm">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={clsx(
              'block w-full rounded-lg border text-gray-900 dark:text-white bg-white dark:bg-gray-900 transition-colors focus:ring-2 focus:ring-[#006D77] focus:border-transparent text-base sm:text-sm py-2.5',
              leftIcon ? 'pl-10' : 'px-4',
              error
                ? 'border-red-500 text-red-900 placeholder-red-300 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-700',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
        </div>
        {error ? (
          <p className="mt-1 text-sm text-red-600 font-medium" id={`${inputId}-error`}>
            {error}
          </p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-gray-500" id={`${inputId}-helper`}>
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
