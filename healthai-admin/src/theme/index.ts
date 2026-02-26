import { createTheme, type ThemeOptions } from '@mui/material/styles';

// ─── Shared design tokens ───────────────────────────────────

const sharedPalette = {
    primary: {
        main: '#2563EB',
        light: '#60A5FA',
        dark: '#1D4ED8',
    },
    secondary: {
        main: '#7C3AED',
        light: '#A78BFA',
        dark: '#5B21B6',
    },
    success: { main: '#16A34A' },
    warning: { main: '#F59E0B' },
    error: { main: '#DC2626' },
};

const sharedOptions: ThemeOptions = {
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h4: { fontWeight: 700 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: { textTransform: 'none', fontWeight: 600 },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: { boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
            },
        },
    },
};

// ─── Light theme ────────────────────────────────────────────

export const lightTheme = createTheme({
    ...sharedOptions,
    palette: {
        mode: 'light',
        ...sharedPalette,
        background: {
            default: '#F8FAFC',
            paper: '#FFFFFF',
        },
    },
});

// ─── Dark theme ─────────────────────────────────────────────

export const darkTheme = createTheme({
    ...sharedOptions,
    palette: {
        mode: 'dark',
        ...sharedPalette,
        background: {
            default: '#0F172A',
            paper: '#1E293B',
        },
    },
    components: {
        ...sharedOptions.components,
        MuiCard: {
            styleOverrides: {
                root: { boxShadow: '0 1px 3px rgba(0,0,0,0.3)' },
            },
        },
    },
});

/** Helper to pick theme by mode */
export function getTheme(mode: 'light' | 'dark') {
    return mode === 'dark' ? darkTheme : lightTheme;
}

// Default export for backwards compatibility
export default lightTheme;
