import React from 'react'
import { Bell, Search } from 'lucide-react'
import { Input } from '../ui/Input'

export const Header = () => {
  return (
    <header style={{ 
      height: '70px', 
      borderBottom: '1px solid var(--border-subtle)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      padding: '0 2rem',
      background: 'rgba(10, 11, 15, 0.8)',
      backdropFilter: 'var(--blur-glass)',
      position: 'sticky',
      top: 0,
      zIndex: 30
    }}>
      <div style={{ position: 'relative', width: '300px' }}>
        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <Input 
          placeholder="Search papers..." 
          style={{ 
            paddingLeft: '2.5rem', 
            height: '40px', 
            background: 'var(--bg-surface)', 
            border: '1px solid var(--border-subtle)' 
          }} 
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <button style={{ color: 'var(--text-secondary)', position: 'relative' }}>
          <Bell size={20} />
          <span style={{ 
            position: 'absolute', 
            top: '-2px', 
            right: '-2px', 
            width: '8px', 
            height: '8px', 
            background: 'var(--color-error)', 
            borderRadius: '50%' 
          }}></span>
        </button>
      </div>
    </header>
  )
}
