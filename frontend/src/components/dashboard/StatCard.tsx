import React from 'react'
import { TiltCard } from '../ui/TiltCard'
import { motion } from 'framer-motion'

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  delay?: number;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      style={{ height: '100%' }}
    >
      <TiltCard style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>
              {title}
            </p>
            <h3 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {value}
            </h3>
            {trend && (
              <p style={{ fontSize: '0.75rem', color: 'var(--color-success)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)', boxShadow: '0 0 8px var(--color-success)' }}></span>
                {trend}
              </p>
            )}
          </div>
          <div style={{ padding: '0.75rem', background: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)', color: 'var(--accent-primary)', border: '1px solid var(--border-subtle)' }}>
            {icon}
          </div>
        </div>
        
        {/* Decorative background glow */}
        <div style={{
          position: 'absolute',
          bottom: '-20px',
          right: '-20px',
          width: '100px',
          height: '100px',
          background: 'var(--accent-glow)',
          borderRadius: '50%',
          filter: 'blur(30px)',
          zIndex: -1,
          pointerEvents: 'none'
        }} />
      </TiltCard>
    </motion.div>
  )
}
