import React, { useState } from 'react';
import { cn } from '../../lib/cn';
import { AnimatePresence, motion } from 'framer-motion';

export interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
  delay = 0.3,
  className
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    const id = setTimeout(() => setIsVisible(true), delay * 1000);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsVisible(false);
  };

  const positionStyles = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2"
  };

  const arrowStyles = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-[var(--color-surface)] border-b-transparent border-l-transparent border-r-transparent",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-[var(--color-surface)] border-t-transparent border-l-transparent border-r-transparent",
    left: "left-full top-1/2 -translate-y-1/2 border-l-[var(--color-surface)] border-r-transparent border-t-transparent border-b-transparent",
    right: "right-full top-1/2 -translate-y-1/2 border-r-[var(--color-surface)] border-l-transparent border-t-transparent border-b-transparent"
  };

  return (
    <div 
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute z-50 px-2.5 py-1.5 text-xs font-medium rounded-md shadow-lg pointer-events-none whitespace-nowrap",
              "bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)]",
              positionStyles[position],
              className
            )}
          >
            {content}
            <div className={cn("absolute w-0 h-0 border-[4px]", arrowStyles[position])} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
