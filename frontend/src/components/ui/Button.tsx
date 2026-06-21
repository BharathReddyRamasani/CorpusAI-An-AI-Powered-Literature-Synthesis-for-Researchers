import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    
    const baseStyles = "relative inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-[0.98] outline-none disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 rounded-[16px]";
    
    const sizeStyles = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-5 py-2.5 text-sm",
      lg: "px-6 py-3 text-base",
      icon: "p-2 aspect-square flex items-center justify-center"
    };

    const variantStyles = {
      primary: "bg-[var(--color-primary)] text-white hover:opacity-90 shadow-[0_4px_14px_0_color-mix(in_srgb,var(--color-primary)_40%,transparent)]",
      secondary: "bg-[var(--color-secondary)] text-white hover:opacity-90 shadow-[0_4px_14px_0_color-mix(in_srgb,var(--color-secondary)_40%,transparent)]",
      ghost: "bg-transparent text-[var(--color-text-primary)] hover:bg-[color-mix(in_srgb,var(--color-text-primary)_10%,transparent)]",
      outline: "bg-transparent border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[color-mix(in_srgb,var(--color-text-primary)_5%,transparent)]",
      danger: "bg-red-500 text-white hover:opacity-90 shadow-[0_4px_14px_0_rgba(239,68,68,0.4)]"
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        <span className={cn("inline-flex items-center justify-center gap-2 transition-opacity", isLoading ? "opacity-0" : "opacity-100")}>
          {children}
        </span>
        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin" />
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
