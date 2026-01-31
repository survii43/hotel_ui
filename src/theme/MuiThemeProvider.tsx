/**
 * Wraps MUI ThemeProvider with theme derived from app ThemeContext (resolvedTheme).
 * Use inside ThemeProvider so MUI components respect light/dark and match app CSS variables.
 */
import { useMemo, type ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { useTheme } from '../contexts/ThemeContext';
import { getAppMuiTheme } from './muiTheme';

export function MuiThemeProviderWrapper({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const theme = useMemo(
    () => getAppMuiTheme(resolvedTheme === 'dark' ? 'dark' : 'light'),
    [resolvedTheme]
  );
  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
}
