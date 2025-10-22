'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-surface hover:bg-surface-hover transition-colors duration-200"
      title={`Alternar para ${theme === 'light' ? 'modo escuro' : 'modo claro'}`}
    >
      {theme === 'light' ? (
        <MoonIcon className="h-5 w-5 text-text-primary" />
      ) : (
        <SunIcon className="h-5 w-5 text-text-primary" />
      )}
    </button>
  );
}
