import React from 'react';
import { cn } from '../../lib/cn';
import { Button } from './Button';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center p-8 w-full", className)}>
      <div className="w-16 h-16 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] flex items-center justify-center text-[var(--color-primary)] mb-4">
        {icon}
      </div>
      <h3 className="font-display text-lg font-semibold text-[var(--color-text-primary)] mb-2">
        {title}
      </h3>
      <p className="text-[var(--color-text-secondary)] mb-6 max-w-sm">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
