import React from 'react'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className }) => {
  const sizeMap = {
    sm: '16px',
    md: '24px',
    lg: '36px'
  }

  return (
    <div 
      className={`spinner ${className || ''}`}
      style={{
        width: sizeMap[size],
        height: sizeMap[size],
        border: '3px solid var(--border-subtle)',
        borderTopColor: 'var(--accent-primary)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}
    >
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
