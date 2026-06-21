import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Logo } from '../ui/Logo';
import { Button } from '../ui/Button';

export const LandingNav = () => {
  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-background)]/80 backdrop-blur-xl"
    >
      <div className="flex items-center gap-8">
        <Link to="/">
          <Logo size="md" />
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-medium text-sm transition-colors">Features</a>
          <a href="#how" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-medium text-sm transition-colors">How it Works</a>
          <a href="#security" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-medium text-sm transition-colors">Security</a>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Link to="/login" className="hidden sm:block text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-medium text-sm transition-colors mr-2">
          Sign in
        </Link>
        <Link to="/register">
          <Button size="md" variant="primary">
            Get Started
          </Button>
        </Link>
      </div>
    </motion.nav>
  );
};

export default LandingNav;
