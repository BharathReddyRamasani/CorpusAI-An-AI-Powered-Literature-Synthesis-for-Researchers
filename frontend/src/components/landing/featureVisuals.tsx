import React from 'react';
import { motion } from 'framer-motion';

export const UploadVisual = () => (
  <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-[var(--color-background-secondary)] rounded-[20px] border border-[var(--color-border)] p-6 relative overflow-hidden">
    <div className="absolute inset-0 opacity-10 mix-blend-overlay"></div>
    <motion.div 
      animate={{ y: [0, -10, 0] }} 
      transition={{ duration: 4, repeat: Infinity }}
      className="card-surface p-6 shadow-2xl relative z-10 flex flex-col gap-4 w-[80%] max-w-[280px]"
    >
      <div className="h-4 w-1/3 bg-[var(--color-border)] rounded"></div>
      <div className="h-2 w-full bg-[var(--color-background-secondary)] rounded"></div>
      <div className="h-2 w-5/6 bg-[var(--color-background-secondary)] rounded"></div>
      <div className="h-2 w-4/6 bg-[var(--color-background-secondary)] rounded"></div>
    </motion.div>
    <motion.div 
      animate={{ y: [0, 10, 0] }} 
      transition={{ duration: 5, repeat: Infinity, delay: 1 }}
      className="absolute right-4 bottom-4 card-surface p-4 shadow-xl z-20 flex flex-col gap-3 w-[150px]"
    >
      <div className="h-3 w-1/2 bg-[var(--color-primary)] opacity-50 rounded"></div>
      <div className="h-2 w-full bg-[var(--color-background-secondary)] rounded"></div>
    </motion.div>
  </div>
);

export const InsightVisual = () => (
  <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-[var(--color-background-secondary)] rounded-[20px] border border-[var(--color-border)] p-6 relative overflow-hidden">
    <div className="absolute w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,var(--color-accent)_0%,transparent_60%)] opacity-10"></div>
    <div className="card-surface w-[80%] h-[80%] rounded-full border border-[var(--color-accent)] opacity-20 absolute flex items-center justify-center">
      <div className="w-[60%] h-[60%] rounded-full border border-[var(--color-primary)] opacity-40 flex items-center justify-center">
        <div className="w-[40%] h-[40%] rounded-full bg-[var(--color-primary)] shadow-[0_0_40px_var(--color-primary)]"></div>
      </div>
    </div>
  </div>
);

export const CitationVisual = () => (
  <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-[var(--color-background-secondary)] rounded-[20px] border border-[var(--color-border)] p-6 relative overflow-hidden">
    <div className="card-surface p-6 shadow-2xl relative z-10 flex flex-col gap-4 w-[90%]">
      <div className="flex flex-col gap-2">
        <div className="h-2 w-full bg-[var(--color-background-secondary)] rounded"></div>
        <div className="h-2 w-full bg-[var(--color-background-secondary)] rounded flex items-center gap-2">
           <span className="h-2 flex-1 bg-[var(--color-background-secondary)] rounded"></span>
           <motion.span whileHover={{ scale: 1.1 }} className="h-4 w-12 bg-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] rounded flex items-center justify-center"><span className="w-2 h-1 bg-[var(--color-primary)] rounded-full"></span></motion.span>
           <span className="h-2 w-1/4 bg-[var(--color-background-secondary)] rounded"></span>
        </div>
        <div className="h-2 w-5/6 bg-[var(--color-background-secondary)] rounded"></div>
      </div>
      <div className="mt-4 p-3 border-l-2 border-[var(--color-primary)] bg-[var(--color-background)] flex flex-col gap-2">
         <div className="h-2 w-1/4 bg-[var(--color-text-secondary)] rounded opacity-50"></div>
         <div className="h-2 w-5/6 bg-[var(--color-background-secondary)] rounded"></div>
      </div>
    </div>
  </div>
);

export const ToolsVisual = () => (
  <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-[var(--color-background-secondary)] rounded-[20px] border border-[var(--color-border)] p-6 relative overflow-hidden">
    <div className="grid grid-cols-2 gap-4 w-[80%] max-w-[280px]">
      <motion.div whileHover={{ y: -5 }} className="card-surface aspect-square rounded-[16px] flex items-center justify-center shadow-lg border-[var(--color-border)] border">
        <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] opacity-50 blur-sm"></div>
      </motion.div>
      <motion.div whileHover={{ y: -5 }} className="card-surface aspect-square rounded-[16px] flex items-center justify-center shadow-lg border-[var(--color-border)] border">
        <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] opacity-50 blur-sm"></div>
      </motion.div>
      <motion.div whileHover={{ y: -5 }} className="card-surface aspect-square rounded-[16px] flex items-center justify-center shadow-lg border-[var(--color-border)] border">
        <div className="w-8 h-8 rounded bg-[var(--color-secondary)] opacity-50 blur-sm"></div>
      </motion.div>
      <motion.div whileHover={{ y: -5 }} className="card-surface aspect-square rounded-[16px] flex items-center justify-center shadow-lg border-[var(--color-border)] border">
         <div className="grid grid-cols-2 gap-1 w-8 h-8"><div className="bg-[var(--color-text-secondary)] rounded-sm opacity-30"></div><div className="bg-[var(--color-text-secondary)] rounded-sm opacity-30"></div><div className="bg-[var(--color-text-secondary)] rounded-sm opacity-30"></div><div className="bg-[var(--color-text-secondary)] rounded-sm opacity-30"></div></div>
      </motion.div>
    </div>
  </div>
);

export const SecurityVisual = () => (
  <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-[var(--color-background-secondary)] rounded-[20px] border border-[var(--color-border)] p-6 relative overflow-hidden">
    <div className="card-surface p-8 shadow-2xl relative z-10 flex flex-col items-center justify-center rounded-full aspect-square w-[160px] border-[var(--color-border)] border">
      <div className="w-16 h-16 rounded-full border-4 border-[var(--color-success)] opacity-50 flex items-center justify-center">
         <div className="w-6 h-6 rounded-full bg-[var(--color-success)]"></div>
      </div>
    </div>
  </div>
);
