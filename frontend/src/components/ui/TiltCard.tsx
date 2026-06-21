import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '../../lib/cn';

export interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glareColor?: string;
  glass?: boolean;
}

export const TiltCard: React.FC<TiltCardProps> = ({ 
  children, 
  className, 
  onClick,
  glareColor = 'rgba(255,255,255,0.1)',
  glass = false,
  ...props
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7.5deg", "-7.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7.5deg", "7.5deg"]);

  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / rect.width - 0.5);
    y.set(mouseY / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ perspective: 1000, transformStyle: "preserve-3d" }}
      className={cn("w-full h-full", onClick && "cursor-pointer hover-scale", className)}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, cubicBezier: [0.16, 1, 0.3, 1] }}
      {...props}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="w-full h-full"
      >
        <div className={cn(
          "relative w-full h-full overflow-hidden flex flex-col p-6",
          glass ? "glass" : "card-surface"
        )}>
          {/* Glare Layer */}
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(circle at center, ${glareColor} 0%, transparent 80%)`,
              opacity: useTransform(mouseXSpring, [-0.5, 0, 0.5], [0.8, 0, 0.8]),
              translateX: useTransform(glareX, v => `calc(${v} - 50%)`),
              translateY: useTransform(glareY, v => `calc(${v} - 50%)`),
              pointerEvents: 'none',
              zIndex: 10,
              mixBlendMode: 'screen',
            }}
          />
          {/* Content Layer */}
          <div style={{ transform: "translateZ(30px)" }} className="flex-1 flex flex-col relative z-20">
            {children}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
