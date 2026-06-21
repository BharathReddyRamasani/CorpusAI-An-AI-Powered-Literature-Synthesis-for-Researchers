import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helper, icon, ...props }, ref) => {
    return (
      <div className={cn("flex flex-col gap-1.5 w-full", className)}>
        {label && (
          <label className="text-sm font-medium text-[var(--color-text-secondary)] tracking-tight">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 text-[var(--color-text-secondary)] peer-focus:text-[var(--color-primary)] transition-colors z-10 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "peer w-full px-4 py-2.5 bg-[var(--color-surface)] text-[var(--color-text-primary)]",
              "border rounded-[16px] outline-none transition-all duration-200",
              "placeholder-[var(--color-text-secondary)]/50",
              icon ? "pl-11" : "",
              error
                ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/20"
                : "border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20"
            )}
            {...props}
          />
        </div>
        {(error || helper) && (
          <span className={cn("text-xs mt-1", error ? "text-red-500" : "text-[var(--color-text-secondary)]")}>
            {error || helper}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
