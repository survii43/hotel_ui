import {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  type ReactNode,
} from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getResolvedTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('theme') as Theme | null;
  if (stored === 'dark') return 'dark';
  if (stored === 'light') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'system';
  });
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(getResolvedTheme);

  /* Sync theme to DOM and state when theme preference changes. */
  useEffect(() => {
    const root = document.documentElement;
    const resolved = getResolvedTheme();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync theme to DOM
    setResolvedTheme(resolved);
    root.setAttribute('data-theme', resolved);
  }, [theme]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (theme === 'system') {
        const resolved = mq.matches ? 'dark' : 'light';
        setResolvedTheme(resolved);
        document.documentElement.setAttribute('data-theme', resolved);
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem('theme', t);
    const resolved = t === 'system' ? getResolvedTheme() : t;
    setResolvedTheme(resolved);
    document.documentElement.setAttribute('data-theme', resolved);
  };

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
