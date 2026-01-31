/**
 * Material UI theme aligned with app CSS variables (index.css).
 * Single source of truth: same colors/shape as :root and [data-theme="dark"].
 * Use MUI ThemeProvider with this theme so MUI components match the rest of the app.
 */
import type { PaletteMode } from '@mui/material';
import { createTheme } from '@mui/material/styles';

const lightPalette = {
  primary: { main: '#0f766e', light: '#0d9488', dark: '#0f766e' },
  background: { default: '#f8fafc', paper: '#ffffff' },
  text: { primary: '#0f172a', secondary: '#475569', disabled: '#94a3b8' },
  divider: '#e2e8f0',
  error: { main: '#dc2626' },
  action: { hover: '#f1f5f9', selected: '#f1f5f9' },
};

const darkPalette = {
  primary: { main: '#2dd4bf', light: '#5eead4', dark: '#2dd4bf' },
  background: { default: '#0f172a', paper: '#1e293b' },
  text: { primary: '#f8fafc', secondary: '#cbd5e1', disabled: '#64748b' },
  divider: '#334155',
  error: { main: '#f87171' },
  action: { hover: '#334155', selected: '#334155' },
};

export function getAppMuiTheme(mode: PaletteMode) {
  const palette = mode === 'dark' ? darkPalette : lightPalette;
  return createTheme({
    palette: {
      mode,
      ...palette,
    },
    shape: {
      borderRadius: 8,
    },
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
      button: {
        textTransform: 'none',
        fontWeight: 500,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
          },
        },
      },
    },
  });
}
