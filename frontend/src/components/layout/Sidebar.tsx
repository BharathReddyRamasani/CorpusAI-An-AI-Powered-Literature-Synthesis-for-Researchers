import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Globe, Search, User as UserIcon, X, Upload, Settings } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { cn } from '../../lib/cn';
import { Logo } from '../ui/Logo';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { AnimatePresence, motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

export const Sidebar = () => {
  const { user } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { path: '/dashboard', label: t('nav.dashboard'), icon: <LayoutDashboard size={20} /> },
    { path: '/papers', label: t('nav.papers'), icon: <FileText size={20} /> },
    { path: '/global-research', label: t('nav.global'), icon: <Globe size={20} /> },
    { path: '/arxiv', label: 'ArXiv Search', icon: <Search size={20} /> },
    { path: '/graph', label: t('nav.graph'), icon: <Search size={20} /> }, // Using Search as generic icon
    { path: '/settings', label: t('nav.settings'), icon: <Settings size={20} /> },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full w-[260px] bg-[var(--color-surface)] border-r border-[var(--color-border)] pt-6 pb-4 px-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-8 pl-2">
        <Logo size="sm" />
        {/* Mobile close button */}
        <button className="md:hidden p-2 text-[var(--color-text-secondary)]" onClick={toggleSidebar}>
          <X size={20} />
        </button>
      </div>

      <div className="mb-6">
        <div className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white py-2.5 px-4 rounded-[14px] font-display font-bold shadow-md shadow-[var(--color-primary)]/20 text-lg tracking-tight">
          Corpus AI
        </div>
      </div>

      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-[16px] font-medium transition-colors duration-200 tracking-tight",
                isActive 
                  ? "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]" 
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-background-secondary)] hover:text-[var(--color-text-primary)]"
              )}
            >
              {item.icon}
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* User Mini-Card */}
      <div className="mt-auto pt-4 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-3 p-2 rounded-[16px] hover:bg-[var(--color-background-secondary)] transition-colors cursor-pointer">
          <Avatar name={user?.name} size="sm" />
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{user?.name}</p>
            <p className="text-xs text-[var(--color-text-secondary)] truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex h-screen sticky top-0 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={toggleSidebar}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative shadow-xl"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
