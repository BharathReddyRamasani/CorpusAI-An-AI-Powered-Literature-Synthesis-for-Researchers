import React from 'react';
import { cn } from '../../lib/cn';
import { BrainCircuit } from 'lucide-react';

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', className, showText = true }) => {
  const sizeMap = {
    sm: { iconContainer: 'w-8 h-8 rounded-[10px]', iconSize: 18, text: 'text-lg' },
    md: { iconContainer: 'w-10 h-10 rounded-[12px]', iconSize: 22, text: 'text-xl' },
    lg: { iconContainer: 'w-12 h-12 rounded-[14px]', iconSize: 28, text: 'text-3xl' },
  };

  const current = sizeMap[size];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn(
        "flex items-center justify-center bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]",
        current.iconContainer
      )}>
        <BrainCircuit size={current.iconSize} className="text-[var(--color-primary)]" />
      </div>
      {showText && (
        <span className={cn("font-display font-bold tracking-tight", current.text)}>
          Corpus<span className="gradient-text">AI</span>
        </span>
      )}
    </div>
  );
};
