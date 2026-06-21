/**
 * AnimatedCounter — counts up from 0 to `value` on first mount.
 * Pure Framer Motion, respects prefers-reduced-motion.
 */
import React, { useEffect, useRef } from 'react'
import { useReducedMotion, useMotionValue, useTransform, animate, motion } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1.4,
  className,
}) => {
  const shouldReduce = useReducedMotion()
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v))
  useEffect(() => {
    if (shouldReduce) {
      count.set(value)
      return
    }
    const controls = animate(count, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
    })
    return () => controls.stop()
  }, [value, duration, count, shouldReduce])

  return (
    <motion.span className={className}>
      {rounded}
    </motion.span>
  )
}
