import React, { InputHTMLAttributes, forwardRef, useState } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%' }} className={className}>
        {label && (
          <label style={{ 
            fontSize: '0.875rem', 
            fontWeight: 500, 
            color: 'var(--text-secondary)',
            letterSpacing: '-0.01em'
          }}>
            {label}
          </label>
        )}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {icon && (
            <div style={{ position: 'absolute', left: '1rem', color: isFocused ? 'var(--accent-primary)' : 'var(--text-muted)', zIndex: 1, transition: 'color 0.2s' }}>
              {icon}
            </div>
          )}
          <input
            ref={ref}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            style={{
              padding: '0.75rem 1rem',
              paddingLeft: icon ? '3rem' : '1rem',
              background: 'var(--bg-surface-solid)',
              border: `1px solid ${error ? 'var(--color-error)' : isFocused ? 'var(--border-focus)' : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              outline: 'none',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              width: '100%',
              boxShadow: isFocused && !error ? '0 0 0 3px rgba(99, 102, 241, 0.15)' : error && isFocused ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
              ...props.style
            }}
            {...props}
          />
        </div>
        {error && (
          <span style={{ fontSize: '0.75rem', color: 'var(--color-error)', marginTop: '0.25rem' }}>
            {error}
          </span>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'
