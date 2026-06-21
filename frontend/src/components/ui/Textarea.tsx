import React, { TextareaHTMLAttributes, forwardRef, useRef, useEffect } from 'react';
import { cn } from '../../lib/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
  autoResize?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helper, autoResize = true, onChange, ...props }, ref) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const resolvedRef = (ref as any) || internalRef;

    const handleResize = () => {
      if (autoResize && resolvedRef.current) {
        resolvedRef.current.style.height = 'auto';
        resolvedRef.current.style.height = `${resolvedRef.current.scrollHeight}px`;
      }
    };

    useEffect(() => {
      handleResize();
    }, [props.value]);

    return (
      <div className={cn("flex flex-col gap-1.5 w-full", className)}>
        {label && (
          <label className="text-sm font-medium text-[var(--color-text-secondary)] tracking-tight">
            {label}
          </label>
        )}
        <div className="relative flex">
          <textarea
            ref={resolvedRef}
            onChange={(e) => {
              handleResize();
              onChange?.(e);
            }}
            className={cn(
              "w-full px-4 py-3 bg-[var(--color-surface)] text-[var(--color-text-primary)]",
              "border rounded-[16px] outline-none transition-all duration-200 resize-none",
              "placeholder-[var(--color-text-secondary)]/50",
              error
                ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/20"
                : "border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20",
              !autoResize && "resize-y min-h-[100px]"
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

Textarea.displayName = 'Textarea';
