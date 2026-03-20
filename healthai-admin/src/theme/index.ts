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
    info: { main: '#0288D1', contrastText: '#FFFFFF' },
    success: { main: '#166534' },
    warning: { main: '#F59E0B', contrastText: '#1F2937' },
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
        MuiTypography: {
            defaultProps: {
                variantMapping: {
                    h1: 'h1',
                    h2: 'h2',
                    h3: 'h3',
                    h4: 'h4',
                    h5: 'h5',
                    h6: 'h6',
                    subtitle1: 'p',
                    subtitle2: 'p',
                    body1: 'p',
                    body2: 'p',
                    inherit: 'p',
                },
            },
        },
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

function withHighContrast(options: ThemeOptions): ThemeOptions {
    return {
        ...options,
        palette: {
            ...options.palette,
            primary: {
                main: '#000000',
                light: '#111111',
                dark: '#000000',
                contrastText: '#FFFFFF',
            },
            secondary: {
                main: '#FFD400',
                light: '#FFE15A',
                dark: '#CCAA00',
                contrastText: '#000000',
            },
            divider: '#000000',
            text: {
                primary: '#000000',
                secondary: '#111111',
                disabled: '#3A3A3A',
            },
            background: {
                default: '#FFFFFF',
                paper: '#FFFFFF',
            },
            success: {
                main: '#0A5A1A',
                contrastText: '#FFFFFF',
            },
            warning: {
                main: '#7A4A00',
                contrastText: '#FFFFFF',
            },
            error: {
                main: '#9B111E',
                contrastText: '#FFFFFF',
            },
            info: {
                main: '#004A99',
                contrastText: '#FFFFFF',
            },
            action: {
                hover: '#EDEDED',
                selected: '#E1E1E1',
                focus: '#FFD400',
                disabled: '#B8B8B8',
                disabledBackground: '#E3E3E3',
            },
        },
        components: {
            ...options.components,
            MuiCssBaseline: {
                styleOverrides: {
                    '*:focus-visible': {
                        outline: '3px solid #000000',
                        outlineOffset: '2px',
                    },
                },
            },
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundColor: '#FFFFFF',
                        color: '#000000',
                        borderBottom: '2px solid #000000',
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        border: '2px solid #000000',
                        fontWeight: 700,
                    },
                },
            },
            MuiIconButton: {
                styleOverrides: {
                    root: {
                        border: '2px solid transparent',
                        '&:hover': {
                            borderColor: '#000000',
                            backgroundColor: '#EDEDED',
                        },
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        border: '2px solid #000000',
                        boxShadow: 'none',
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        border: '1px solid #000000',
                    },
                },
            },
        },
    };
}

const highContrastLightTheme = createTheme(withHighContrast(lightTheme));
const highContrastDarkTheme = createTheme(withHighContrast(darkTheme));

/** Helper to pick theme by mode */
export function getTheme(mode: 'light' | 'dark', highContrast = false) {
    if (!highContrast) return mode === 'dark' ? darkTheme : lightTheme;
    return mode === 'dark' ? highContrastDarkTheme : highContrastLightTheme;
}

// Default export for backwards compatibility
export default lightTheme;
