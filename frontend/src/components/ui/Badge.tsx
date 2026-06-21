import React from 'react';
import { cn } from '../../lib/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'success' | 'warning' | 'default';
  icon?: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', icon, children, ...props }, ref) => {
    
    const variantStyles = {
      primary: "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)] border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]",
      secondary: "bg-[color-mix(in_srgb,var(--color-secondary)_10%,transparent)] text-[var(--color-secondary)] border-[color-mix(in_srgb,var(--color-secondary)_20%,transparent)]",
      accent: "bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)] text-[var(--color-accent)] border-[color-mix(in_srgb,var(--color-accent)_20%,transparent)]",
      danger: "bg-red-500/10 text-red-500 border-red-500/20",
      success: "bg-green-500/10 text-green-500 border-green-500/20",
      warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      default: "bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)] border-[var(--color-border)]"
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[14px] text-xs font-medium border",
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {icon && <span className="w-3.5 h-3.5 flex items-center justify-center">{icon}</span>}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
