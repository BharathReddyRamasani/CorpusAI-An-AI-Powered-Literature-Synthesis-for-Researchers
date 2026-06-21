import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, Menu, User, Settings, LogOut } from 'lucide-react';
import { Input } from '../ui/Input';
import { Avatar } from '../ui/Avatar';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/cn';
import { AnimatePresence, motion } from 'framer-motion';

export const Header = () => {
  const { user, logout } = useAuthStore();
  const { toggleSidebar } = useUIStore();
  const navigate = useNavigate();
  
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-[72px] px-4 md:px-6 bg-[color-mix(in_srgb,var(--color-background)_80%,transparent)] backdrop-blur-md border-b border-[var(--color-border)]">
      
      {/* Mobile Menu Toggle & Search */}
      <div className="flex items-center gap-4 flex-1">
        <button className="md:hidden p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <div className="hidden sm:block w-full max-w-xs">
          <Input 
            placeholder="Search papers..." 
            icon={<Search size={18} />} 
            className="w-full"
            style={{ borderRadius: 'var(--radius-lg)' }}
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-background-secondary)] rounded-full transition-colors"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[var(--color-background)]"></span>
          </button>
          
          <AnimatePresence>
            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 glass rounded-[20px] shadow-lg overflow-hidden flex flex-col"
              >
                <div className="p-4 border-b border-[var(--color-border)]">
                  <h3 className="font-medium text-[var(--color-text-primary)]">Notifications</h3>
                </div>
                <div className="p-4 text-center text-sm text-[var(--color-text-secondary)] py-8">
                  No new notifications.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button onClick={() => setProfileOpen(!profileOpen)} className="block focus:outline-none">
            <Avatar name={user?.name} size="md" className="hover-scale" />
          </button>
          
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-64 glass rounded-[20px] shadow-lg overflow-hidden flex flex-col"
              >
                <div className="px-4 py-3 border-b border-[var(--color-border)]">
                  <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{user?.name}</p>
                  <p className="text-xs text-[var(--color-text-secondary)] truncate mt-0.5">{user?.email}</p>
                </div>
                <div className="p-2 flex flex-col">
                  <Link 
                    to="/profile" 
                    className="flex items-center gap-3 px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-background-secondary)] rounded-md transition-colors"
                    onClick={() => setProfileOpen(false)}
                  >
                    <User size={16} className="text-[var(--color-text-secondary)]" />
                    Profile
                  </Link>
                  <Link 
                    to="/settings" 
                    className="flex items-center gap-3 px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-background-secondary)] rounded-md transition-colors"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Settings size={16} className="text-[var(--color-text-secondary)]" />
                    Settings
                  </Link>
                </div>
                <div className="p-2 border-t border-[var(--color-border)]">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                  >
                    <LogOut size={16} />
                    Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
