/**
 * KnowledgeGraphHero — CSS 3D + Framer Motion
 * The ONE signature element: an animated constellation of paper-nodes and
 * concept-connections that literally previews what the backend builds.
 * No external 3D library — just perspective transforms + SVG lines.
 */
import React, { useRef, useEffect, useState, useCallback } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { FileText, Sparkles, Link as LinkIcon, BookOpen, Brain, Atom } from 'lucide-react'

interface Node {
  id: number
  x: number   // 0-100 %
  y: number   // 0-100 %
  label: string
  icon: React.ReactNode
  size: 'lg' | 'md' | 'sm'
  color: string
  delay: number
}

interface Edge {
  from: number
  to: number
}

const NODES: Node[] = [
  { id: 0, x: 50, y: 20, label: 'Your Paper',       icon: <FileText size={16} />,   size: 'lg', color: 'var(--color-primary)',   delay: 0    },
  { id: 1, x: 22, y: 45, label: 'AI Summary',        icon: <Sparkles size={14} />,   size: 'md', color: 'var(--color-accent)',    delay: 0.1  },
  { id: 2, x: 76, y: 42, label: 'Citation Graph',    icon: <LinkIcon size={14} />,   size: 'md', color: 'var(--color-secondary)', delay: 0.15 },
  { id: 3, x: 38, y: 68, label: 'Literature Review', icon: <BookOpen size={12} />,   size: 'sm', color: 'var(--color-primary)',   delay: 0.2  },
  { id: 4, x: 64, y: 70, label: 'Insights',          icon: <Brain size={12} />,      size: 'sm', color: 'var(--color-accent)',    delay: 0.25 },
  { id: 5, x: 15, y: 72, label: 'Source Paper',      icon: <Atom size={11} />,       size: 'sm', color: 'var(--color-secondary)', delay: 0.3  },
  { id: 6, x: 84, y: 68, label: 'Related Work',      icon: <FileText size={11} />,   size: 'sm', color: 'var(--color-primary)',   delay: 0.35 },
]

const EDGES: Edge[] = [
  { from: 0, to: 1 }, { from: 0, to: 2 }, { from: 1, to: 3 },
  { from: 2, to: 4 }, { from: 1, to: 5 }, { from: 2, to: 6 },
  { from: 3, to: 4 },
]

const SIZE_MAP = { lg: 60, md: 48, sm: 38 }

export const KnowledgeGraphHero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 })
  const shouldReduce = useReducedMotion()
  const rafRef = useRef<number>()

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top)  / rect.height
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      setMouse({ x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) })
    })
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el || shouldReduce) return
    el.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => {
      el.removeEventListener('mousemove', handleMouseMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [handleMouseMove, shouldReduce])

  // Subtle perspective tilt following cursor
  const tiltX = shouldReduce ? 0 : (mouse.y - 0.5) * -8
  const tiltY = shouldReduce ? 0 : (mouse.x - 0.5) *  8

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none"
      style={{ height: 420, perspective: 900 }}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateX: tiltX, rotateY: tiltY }}
        transition={{ type: 'spring', stiffness: 80, damping: 25, mass: 0.5 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* SVG edges — drawn first (behind nodes) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
          style={{ zIndex: 0 }}
        >
          <defs>
            <linearGradient id="edge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="var(--color-primary)"   stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--color-accent)"    stopOpacity="0.2" />
            </linearGradient>
          </defs>
          {EDGES.map((edge, i) => {
            const from = NODES[edge.from]
            const to   = NODES[edge.to]
            return (
              <motion.line
                key={i}
                x1={`${from.x}%`} y1={`${from.y}%`}
                x2={`${to.x}%`}   y2={`${to.y}%`}
                stroke="url(#edge-grad)"
                strokeWidth="1.5"
                strokeDasharray="5 3"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.2, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
              />
            )
          })}
        </svg>

        {/* Nodes */}
        {NODES.map((node) => {
          const size = SIZE_MAP[node.size]
          return (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.6,
                delay: node.delay,
                type: 'spring',
                stiffness: 200,
                damping: 20,
              }}
              // Subtle float — each node drifts on its own cycle
              style={{
                position: 'absolute',
                left: `${node.x}%`,
                top:  `${node.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 10,
                width: size,
                height: size,
              }}
            >
              <motion.div
                animate={shouldReduce ? {} : {
                  y: [0, node.id % 2 === 0 ? -6 : 6, 0],
                }}
                transition={{
                  duration: 3 + node.id * 0.4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: node.id * 0.3,
                }}
                className="relative w-full h-full flex flex-col items-center justify-center rounded-2xl cursor-default"
                style={{
                  background: `color-mix(in srgb, ${node.color} 12%, var(--color-surface))`,
                  border: `1px solid color-mix(in srgb, ${node.color} 30%, var(--color-border))`,
                  boxShadow: `0 4px 20px color-mix(in srgb, ${node.color} 20%, transparent)`,
                  backdropFilter: 'blur(8px)',
                }}
              >
                {/* Icon */}
                <span style={{ color: node.color }} className="opacity-90">
                  {node.icon}
                </span>
                {/* Pulse ring on the central node only */}
                {node.size === 'lg' && !shouldReduce && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.3, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ border: `2px solid ${node.color}`, pointerEvents: 'none' }}
                  />
                )}
              </motion.div>
              {/* Label below node */}
              {node.size !== 'sm' && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.75 }}
                  transition={{ delay: node.delay + 0.4 }}
                  className="absolute top-full mt-1.5 text-[10px] font-medium whitespace-nowrap text-center w-max -translate-x-1/4"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {node.label}
                </motion.p>
              )}
            </motion.div>
          )
        })}

        {/* Ambient depth blobs — behind everything */}
        <div
          className="absolute pointer-events-none"
          style={{
            inset: '-20%',
            background: `radial-gradient(ellipse at 50% 30%, color-mix(in srgb, var(--color-primary) 12%, transparent) 0%, transparent 70%)`,
            zIndex: 0,
          }}
        />
      </motion.div>
    </div>
  )
}

export default KnowledgeGraphHero
