import React, { ButtonHTMLAttributes, forwardRef, useState } from 'react'
import { Spinner } from './Spinner'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    
    const [isHovered, setIsHovered] = useState(false)
    const [isActive, setIsActive] = useState(false)

    const baseStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 'var(--radius-md)',
      fontWeight: 500,
      letterSpacing: '0.01em',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
      opacity: disabled || isLoading ? 0.6 : 1,
      transform: isActive && !disabled && !isLoading ? 'scale(0.97)' : 'scale(1)',
      border: 'none',
      outline: 'none',
    }

    const sizeStyles = {
      sm: { padding: '0.375rem 0.75rem', fontSize: '0.875rem' },
      md: { padding: '0.5rem 1.25rem', fontSize: '0.9375rem' },
      lg: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
    }

    const variantStyles = {
      primary: {
        background: isHovered && !disabled ? 'var(--accent-primary-hover)' : 'var(--accent-primary)',
        color: '#fff',
        boxShadow: isHovered && !disabled ? '0 0 20px rgba(99,102,241,0.6), inset 0 1px 0 rgba(255,255,255,0.2)' : '0 4px 14px 0 rgba(99, 102, 241, 0.39), inset 0 1px 0 rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.1)'
      },
      secondary: {
        background: isHovered && !disabled ? 'rgba(255, 255, 255, 0.1)' : 'var(--bg-surface-hover)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-subtle)',
        boxShadow: isHovered && !disabled ? '0 0 15px rgba(255,255,255,0.05)' : 'none'
      },
      danger: {
        background: isHovered && !disabled ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
        color: 'var(--color-error)',
        border: '1px solid rgba(239, 68, 68, 0.4)',
        boxShadow: isHovered && !disabled ? '0 0 15px rgba(239, 68, 68, 0.3)' : 'none'
      },
      ghost: {
        background: isHovered && !disabled ? 'var(--bg-surface-hover)' : 'transparent',
        color: 'var(--text-primary)',
      }
    }

    const combinedStyles = {
      ...baseStyles,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...props.style,
      transform: isActive && !disabled && !isLoading ? 'scale(0.95)' : isHovered && !disabled && !isLoading ? 'scale(1.02)' : 'scale(1)',
      transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
    }

    return (
      <button
        ref={ref}
        className={className}
        style={combinedStyles}
        disabled={disabled || isLoading}
        onMouseEnter={(e) => { setIsHovered(true); props.onMouseEnter?.(e) }}
        onMouseLeave={(e) => { setIsHovered(false); setIsActive(false); props.onMouseLeave?.(e) }}
        onMouseDown={(e) => { setIsActive(true); props.onMouseDown?.(e) }}
        onMouseUp={(e) => { setIsActive(false); props.onMouseUp?.(e) }}
        {...props}
      >
        {isLoading && <Spinner size="sm" className="mr-2" style={{ marginRight: '8px', borderTopColor: variant === 'primary' ? '#fff' : 'var(--accent-primary)' }} />}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
