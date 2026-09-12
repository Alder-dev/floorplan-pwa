import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'floorplan-theme';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // localStorage no disponible
  }
  // Lee la clase que inyectó el script inline en index.html
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

/**
 * Proveedor de tema. Colócalo lo más alto posible en el árbol (en main.tsx)
 * para que TODA la app reaccione al toggle sin instancias duplicadas.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getStoredTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    // Actualiza theme-color del navegador/PWA
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'dark' ? '#0D1117' : '#F3F5F8');
    }
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook para consumir el tema. Lanza error si se usa fuera de ThemeProvider.
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>');
  return ctx;
}
