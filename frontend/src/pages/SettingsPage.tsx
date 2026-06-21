import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Globe, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../i18n/translations';

export default function SettingsPage() {
  const { activeTheme: theme, applyTheme: setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const handleSetLanguage = (id: string) => {
    setLanguage(id as Language);
  };

  const themes = [
    { id: 'arctic-light', name: 'Arctic Research', subtitle: 'Light Mode', colors: ['#3b82f6', '#0ea5e9', '#0f172a'] },
    { id: 'carbon-dark', name: 'Carbon Obsidian', subtitle: 'Dark Mode', colors: ['#8b5cf6', '#a855f7', '#f8fafc'] },
    { id: 'charcoal-dark', name: 'Charcoal Bronze', subtitle: 'Dark Mode', colors: ['#f59e0b', '#f97316', '#f8fafc'] },
    { id: 'plum-dark', name: 'Plum Dusk', subtitle: 'Dark Mode', colors: ['#c026d3', '#e879f9', '#fdf4ff'] },
  ];

  const languages = [
    { id: 'English', label: 'English', native: 'English' },
    { id: 'Hindi', label: 'Hindi', native: 'हिन्दी' },
    { id: 'Telugu', label: 'Telugu', native: 'తెలుగు' },
  ];

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto w-full">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--color-text-primary)] mb-2">{t('settings.title')}</h1>
        <p className="text-[var(--color-text-secondary)] text-lg">{t('settings.subtitle')}</p>
      </motion.div>

      <div className="flex flex-col gap-8">
        {/* Theme Settings */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-surface rounded-[24px] p-6 sm:p-8"
        >
          <div className="flex items-start gap-4 mb-8">
            <div className="p-3 bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] rounded-xl text-[var(--color-primary)]">
              <Palette size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{t('settings.theme.title')}</h2>
              <p className="text-[var(--color-text-secondary)]">{t('settings.theme.subtitle')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id as any)}
                className={`relative flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${
                  theme === t.id 
                    ? 'border-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_5%,transparent)] shadow-[0_0_0_1px_var(--color-primary)]' 
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-background-secondary)] hover:border-[var(--color-text-muted)]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {t.colors.map((color, i) => (
                      <div 
                        key={i} 
                        className="w-6 h-6 rounded-full border-2 border-[var(--color-surface)]" 
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="text-left">
                    <p className={`font-semibold ${theme === t.id ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
                      {t.name}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">{t.subtitle}</p>
                  </div>
                </div>
                {theme === t.id && (
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)]">
                    <Check size={14} strokeWidth={3} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Language Settings */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-surface rounded-[24px] p-6 sm:p-8"
        >
          <div className="flex items-start gap-4 mb-8">
            <div className="p-3 bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)] rounded-xl text-[var(--color-accent)]">
              <Globe size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{t('settings.lang.title')}</h2>
              <p className="text-[var(--color-text-secondary)]">{t('settings.lang.subtitle')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {languages.map((lang) => (
              <button
                key={lang.id}
                onClick={() => handleSetLanguage(lang.id)}
                className={`relative flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${
                  language === lang.id 
                    ? 'border-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_5%,transparent)] shadow-[0_0_0_1px_var(--color-primary)]' 
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-background-secondary)] hover:border-[var(--color-text-muted)]'
                }`}
              >
                <div className="text-left">
                  <p className={`font-semibold ${language === lang.id ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
                    {lang.label}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">{lang.native}</p>
                </div>
                {language === lang.id && (
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)]">
                    <Check size={14} strokeWidth={3} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
