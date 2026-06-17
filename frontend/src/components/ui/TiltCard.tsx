import React, { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  glareColor?: string;
}

export const TiltCard: React.FC<TiltCardProps> = ({ 
  children, 
  className, 
  style, 
  onClick,
  glareColor = 'rgba(255,255,255,0.1)'
}) => {
  const ref = useRef<HTMLDivElement>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Smooth the mouse values
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 })
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 })

  // Map mouse position to rotation angle (max 15 degrees)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7.5deg", "-7.5deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7.5deg", "7.5deg"])

  // Glare effect movement
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"])
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    
    const width = rect.width
    const height = rect.height
    
    // Mouse position relative to center of card (-0.5 to 0.5)
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    
    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        perspective: 1000,
        transformStyle: "preserve-3d",
        cursor: onClick ? 'pointer' : 'default',
        width: '100%',
        height: '100%',
        ...style
      }}
      className={className}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, cubicBezier: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          width: '100%',
          height: '100%',
          transformStyle: "preserve-3d",
        }}
      >
        <div 
          className="glass-panel"
          style={{ 
            position: 'relative', 
            width: '100%', 
            height: '100%', 
            padding: '1.5rem',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Glare Layer */}
          <motion.div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(circle at center, ${glareColor} 0%, transparent 80%)`,
              opacity: useTransform(mouseXSpring, [-0.5, 0, 0.5], [0.8, 0, 0.8]),
              translateX: useTransform(glareX, v => `calc(${v} - 50%)`),
              translateY: useTransform(glareY, v => `calc(${v} - 50%)`),
              pointerEvents: 'none',
              zIndex: 10,
              mixBlendMode: 'screen',
            }}
          />
          
          {/* Content Layer (slightly lifted in 3D) */}
          <div style={{ transform: "translateZ(30px)", flex: 1, display: 'flex', flexDirection: 'column' }}>
            {children}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
