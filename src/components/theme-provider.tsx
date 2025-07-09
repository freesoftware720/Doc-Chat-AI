
'use client';

import { useEffect, useState } from 'react';
import { ThemeContext, type Theme } from '@/hooks/use-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('default');

  useEffect(() => {
    // On mount, read the theme from localStorage or default to 'default'
    const storedTheme = localStorage.getItem('app-theme') as Theme | null;
    if (storedTheme && ['default', 'green', 'orange'].includes(storedTheme)) {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    // When the theme changes, update the data attribute and localStorage
    const root = window.document.documentElement;
    root.classList.remove('default', 'green', 'orange'); // clean up previous themes
    if (theme !== 'default') {
      root.setAttribute('data-theme', theme);
    } else {
        root.removeAttribute('data-theme');
    }
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
