import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageSquare, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface SelectionPos {
  x: number;
  y: number;
  text: string;
}

export const SelectionToolbar: React.FC = () => {
  const [selection, setSelection] = useState<SelectionPos | null>(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      const activeSelection = window.getSelection();
      if (!activeSelection || activeSelection.isCollapsed) {
        setSelection(null);
        return;
      }

      const text = activeSelection.toString().trim();
      if (text.length < 3) {
        setSelection(null);
        return;
      }

      try {
        const range = activeSelection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // Calculate position relative to viewport
        setSelection({
          x: rect.left + rect.width / 2,
          y: rect.top, // position above the selection
          text
        });
      } catch (e) {
        setSelection(null);
      }
    };

    const handleMouseUp = () => {
      // Small timeout to allow double-click selection to resolve
      setTimeout(handleSelectionChange, 10);
    };

    // Listen to mouseup to capture when user finishes selecting
    document.addEventListener('mouseup', handleMouseUp);
    
    // Clear selection on scroll or mousedown to prevent sticky toolbar
    const handleClear = () => {
      if (window.getSelection()?.isCollapsed) {
        setSelection(null);
      }
    };
    
    document.addEventListener('mousedown', handleClear);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleClear);
    };
  }, []);

  const handleExplain = () => {
    if (!selection) return;
    toast.custom((t) => (
      <div className="bg-[var(--color-surface)] border border-[var(--color-primary)] shadow-2xl rounded-2xl p-4 max-w-sm">
        <h4 className="flex items-center gap-2 text-[var(--color-primary)] font-bold mb-2">
          <Sparkles size={16} /> Corpus AI Explanation
        </h4>
        <p className="text-sm text-[var(--color-text-secondary)] italic mb-2">"{selection.text.length > 50 ? selection.text.slice(0, 50) + '...' : selection.text}"</p>
        <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">
          This text refers to complex methodologies commonly used in the context of the paper. It suggests advanced approaches for data processing.
        </p>
      </div>
    ), { duration: 5000 });
    
    window.getSelection()?.removeAllRanges();
    setSelection(null);
  };

  const handleAction = (msg: string) => {
    toast.success(msg);
    window.getSelection()?.removeAllRanges();
    setSelection(null);
  };

  return (
    <AnimatePresence>
      {selection && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="fixed z-[9999] flex gap-1 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl rounded-xl p-1.5"
          style={{
            left: selection.x,
            top: selection.y - 60, // 60px above the selection
            transform: 'translateX(-50%)', // Center horizontally
          }}
        >
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[var(--color-surface)] border-b border-r border-[var(--color-border)] rotate-45" />
          
          <button 
            onClick={handleExplain}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-text-primary)] hover:text-[var(--color-primary)] transition-colors text-sm font-medium relative z-10"
          >
            <Sparkles size={14} /> Explain
          </button>
          
          <div className="w-px bg-[var(--color-border)] my-1" />
          
          <button 
            onClick={() => handleAction('Added to Flashcards!')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] transition-colors text-sm font-medium relative z-10"
          >
            <PlusCircle size={14} /> Card
          </button>
          
          <div className="w-px bg-[var(--color-border)] my-1" />
          
          <button 
            onClick={() => handleAction('Summary requested')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] transition-colors text-sm font-medium relative z-10"
          >
            <MessageSquare size={14} /> Ask
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
