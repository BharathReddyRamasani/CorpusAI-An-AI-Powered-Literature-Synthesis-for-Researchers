import React from 'react';
import { motion } from 'framer-motion';

interface FeatureProps {
  feature: {
    tag: string;
    icon: React.ElementType;
    title: string;
    desc: string;
    points: string[];
    visual: React.ReactNode;
  };
  index: number;
}

export const FeatureSection: React.FC<FeatureProps> = ({ feature, index }) => {
  const isEven = index % 2 === 0;

  return (
    <div className={`flex flex-col gap-12 md:gap-24 md:items-center ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
      <motion.div 
        initial={{ opacity: 0, x: isEven ? -40 : 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
        className="flex-1 space-y-6"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1">
           <feature.icon size={14} className="text-[var(--color-primary)]" />
           <span className="text-xs font-semibold text-[var(--color-text-secondary)] tracking-wide uppercase">{feature.tag}</span>
        </div>
        <h3 className="font-display text-3xl font-semibold tracking-tight text-[var(--color-text-primary)] md:text-4xl">
          {feature.title}
        </h3>
        <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed text-pretty">
          {feature.desc}
        </p>
        <ul className="space-y-3 pt-2">
          {feature.points.map((point, i) => (
            <li key={i} className="flex items-center gap-3 text-[var(--color-text-secondary)]">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]">
                <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
              </div>
              {point}
            </li>
          ))}
        </ul>
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="flex-[1.2] w-full"
      >
        {feature.visual}
      </motion.div>
    </div>
  );
};

export default FeatureSection;
