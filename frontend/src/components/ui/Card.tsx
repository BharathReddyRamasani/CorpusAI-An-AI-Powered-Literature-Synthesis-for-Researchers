import React, { useState } from 'react'

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, style, onClick, hoverable = false }) => {
  const [isHovered, setIsHovered] = useState(false)
  
  const isInteractive = onClick || hoverable;

  return (
    <div
      className={`glass-panel ${className || ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={{
        padding: '1.5rem',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isInteractive && isHovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: isInteractive && isHovered 
          ? '0 12px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
          : 'var(--shadow-panel)',
        border: isInteractive && isHovered 
          ? '1px solid rgba(255, 255, 255, 0.15)' 
          : '1px solid var(--border-subtle)',
        ...style
      }}
    >
      {children}
    </div>
  )
}
