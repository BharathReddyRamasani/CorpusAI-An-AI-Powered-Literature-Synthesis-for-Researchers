import React from 'react';
import { cn } from '../../lib/cn';

export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  label?: string;
  description?: string;
}

export const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(
  ({ enabled, onToggle, label, description, className, disabled, ...props }, ref) => {
    return (
      <label className={cn("flex items-center justify-between gap-4 cursor-pointer", disabled && "opacity-60 cursor-not-allowed", className)}>
        {(label || description) && (
          <div className="flex flex-col">
            {label && <span className="font-medium text-[var(--color-text-primary)]">{label}</span>}
            {description && <span className="text-sm text-[var(--color-text-secondary)]">{description}</span>}
          </div>
        )}
        <div className="relative inline-flex items-center">
          <input
            type="checkbox"
            className="sr-only"
            checked={enabled}
            onChange={(e) => onToggle(e.target.checked)}
            disabled={disabled}
            ref={ref}
            {...props}
          />
          <div 
            className={cn(
              "w-11 h-6 rounded-full transition-colors duration-200 ease-in-out",
              enabled ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]"
            )}
          />
          <div 
            className={cn(
              "absolute left-[2px] top-[2px] w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out shadow-sm",
              enabled ? "translate-x-5" : "translate-x-0"
            )}
          />
        </div>
      </label>
    );
  }
);

Toggle.displayName = 'Toggle';
