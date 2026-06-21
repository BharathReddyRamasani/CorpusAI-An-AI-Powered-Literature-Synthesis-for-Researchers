import React from 'react';
import { cn } from '../../lib/cn';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => {
  return (
    <nav className={cn("flex items-center text-sm", className)} aria-label="Breadcrumb">
      <ol className="flex items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors font-medium tracking-tight"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={cn(isLast ? "text-[var(--color-text-primary)] font-semibold" : "text-[var(--color-text-secondary)]", "tracking-tight")}>
                  {item.label}
                </span>
              )}
              {!isLast && <ChevronRight size={14} className="text-[var(--color-text-secondary)]/50" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
