import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/cn';
import { ChevronDown, Check } from 'lucide-react';

export interface Option {
  label: string;
  value: string;
}

export interface SelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  label,
  placeholder = "Select an option...",
  error,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)} ref={containerRef}>
      {label && (
        <label className="text-sm font-medium text-[var(--color-text-secondary)] tracking-tight">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center justify-between px-4 py-2.5 bg-[var(--color-surface)]",
            "border rounded-[16px] outline-none transition-all duration-200",
            isOpen ? "border-[var(--color-primary)] ring-4 ring-[var(--color-primary)]/20" : "border-[var(--color-border)]",
            error ? "border-red-500" : "",
            "text-left"
          )}
        >
          <span className={cn(selectedOption ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]/50")}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown size={18} className={cn("text-[var(--color-text-secondary)] transition-transform duration-200", isOpen && "rotate-180")} />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-[var(--color-card)] border border-[var(--color-border)] rounded-[16px] shadow-lg overflow-hidden glass">
            <ul className="max-h-60 overflow-y-auto py-1">
              {options.map((option) => (
                <li
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors",
                    "hover:bg-[color-mix(in_srgb,var(--color-text-primary)_5%,transparent)]",
                    value === option.value ? "text-[var(--color-primary)] font-medium bg-[color-mix(in_srgb,var(--color-primary)_5%,transparent)]" : "text-[var(--color-text-primary)]"
                  )}
                >
                  {option.label}
                  {value === option.value && <Check size={16} />}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
    </div>
  );
};
