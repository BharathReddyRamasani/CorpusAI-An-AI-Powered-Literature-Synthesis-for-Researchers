import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeId = 'arctic-light' | 'carbon-dark' | 'charcoal-dark' | 'plum-dark';

export interface ThemePreset {
  id: ThemeId;
  name: string;
  isDark: boolean;
  colors: {
    background: string;
    backgroundSecondary: string;
    surface: string;
    card: string;
    primary: string;
    secondary: string;
    accent: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
  };
}

export const themes: Record<ThemeId, ThemePreset> = {
  'arctic-light': {
    id: 'arctic-light',
    name: 'Arctic Research',
    isDark: false,
    colors: {
      background: '#F5F7FA',
      backgroundSecondary: '#EEF2F7',
      surface: '#FFFFFF',
      card: '#FFFFFF',
      primary: '#4F46E5',
      secondary: '#3B82F6',
      accent: '#14B8A6',
      textPrimary: '#111827',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
    }
  },
  'carbon-dark': {
    id: 'carbon-dark',
    name: 'Carbon Obsidian',
    isDark: true,
    colors: {
      background: '#0B0B0C',
      backgroundSecondary: '#141416',
      surface: '#18181B',
      card: '#18181B',
      primary: '#8B5CF6',
      secondary: '#6366F1',
      accent: '#10B981',
      textPrimary: '#F9FAFB',
      textSecondary: '#9CA3AF',
      border: '#27272A',
    }
  },
  'charcoal-dark': {
    id: 'charcoal-dark',
    name: 'Charcoal Bronze',
    isDark: true,
    colors: {
      background: '#121111',
      backgroundSecondary: '#1C1917',
      surface: '#292524',
      card: '#292524',
      primary: '#F59E0B',
      secondary: '#D97706',
      accent: '#EC4899',
      textPrimary: '#FFFBEB',
      textSecondary: '#A8A29E',
      border: '#44403C',
    }
  },
  'plum-dark': {
    id: 'plum-dark',
    name: 'Plum Dusk',
    isDark: true,
    colors: {
      background: '#0F0A15',
      backgroundSecondary: '#1A1025',
      surface: '#2E1A47',
      card: '#2E1A47',
      primary: '#C084FC',
      secondary: '#A855F7',
      accent: '#F43F5E',
      textPrimary: '#FAF5FF',
      textSecondary: '#D8B4FE',
      border: '#4C2889',
    }
  }
};

interface ThemeContextType {
  activeTheme: ThemeId;
  applyTheme: (themeId: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTheme, setActiveTheme] = useState<ThemeId>(() => {
    const saved = localStorage.getItem('theme-preference');
    return (saved as ThemeId) || 'arctic-light';
  });

  const applyTheme = (themeId: ThemeId) => {
    const theme = themes[themeId];
    if (!theme) return;

    setActiveTheme(themeId);
    localStorage.setItem('theme-preference', themeId);

    const root = document.documentElement;
    if (theme.isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply exact CSS variables
    root.style.setProperty('--color-background', theme.colors.background);
    root.style.setProperty('--color-background-secondary', theme.colors.backgroundSecondary);
    root.style.setProperty('--color-surface', theme.colors.surface);
    root.style.setProperty('--color-card', theme.colors.card);
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-accent', theme.colors.accent);
    root.style.setProperty('--color-text-primary', theme.colors.textPrimary);
    root.style.setProperty('--color-text-secondary', theme.colors.textSecondary);
    root.style.setProperty('--color-border', theme.colors.border);
  };

  // Run once on mount
  useEffect(() => {
    applyTheme(activeTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{ activeTheme, applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
