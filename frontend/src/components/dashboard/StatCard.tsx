import React from 'react'
import { motion } from 'framer-motion'
import { AnimatedCounter } from '../ui/AnimatedCounter'

export interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: string
  delay?: number
  /** Accent colour for icon bg + glow. Defaults to --color-primary. */
  accent?: string
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  delay = 0,
  accent = 'var(--color-primary)',
}) => {
  const isNumeric = typeof value === 'number'

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="card-surface hover-lift relative overflow-hidden group rounded-[20px] p-6">
        {/* Header row */}
        <div className="flex justify-between items-start mb-4">
          <p className="text-sm font-semibold text-[var(--color-text-secondary)] tracking-tight uppercase text-[11px] letter-spacing-widest">
            {title}
          </p>
          <div
            className="p-2.5 rounded-[12px] border transition-transform duration-300 group-hover:scale-110"
            style={{
              background: `color-mix(in srgb, ${accent} 12%, transparent)`,
              border:      `1px solid color-mix(in srgb, ${accent} 25%, transparent)`,
              color:       accent,
            }}
          >
            {icon}
          </div>
        </div>

        {/* Value */}
        <h3 className="font-display text-4xl font-bold text-[var(--color-text-primary)] tracking-tight leading-none">
          {isNumeric
            ? <AnimatedCounter value={value as number} />
            : value
          }
        </h3>

        {trend && (
          <p className="flex items-center gap-1.5 text-xs mt-3 font-semibold" style={{ color: accent }}>
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: accent, boxShadow: `0 0 6px ${accent}` }}
            />
            {trend}
          </p>
        )}

        {/* Ambient glow blob */}
        <div
          className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full blur-[32px] pointer-events-none opacity-10 group-hover:opacity-20 transition-opacity duration-500"
          style={{ background: accent }}
        />
      </div>
    </motion.div>
  )
}
