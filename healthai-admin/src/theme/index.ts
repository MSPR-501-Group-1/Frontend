import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
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
        background: {
            default: '#F8FAFC',
            paper: '#FFFFFF',
        },
    },
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
});

export default theme;
