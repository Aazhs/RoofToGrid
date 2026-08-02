'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggle: () => {},
});

/**
 * Global theme provider. Toggles `class="dark"` on <html>.
 *
 * Persists choice to localStorage so it survives reloads.
 * Defaults to dark (Nocturnal Intellect) for new visitors.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('rtg-theme') as Theme | null;
    if (stored === 'light' || stored === 'dark') {
      setTheme(stored);
    }
  }, []);

  // Apply class to <html> whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('rtg-theme', theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
