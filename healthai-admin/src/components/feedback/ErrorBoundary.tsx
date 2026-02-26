/**
 * React Error Boundary — catches uncaught rendering errors.
 *
 * Wraps the entire app so a single component crash doesn't
 * white-screen the whole interface.
 *
 * React 19 still requires class components for error boundaries.
 */

import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo): void {
        // Log to console in dev; in production this would go to a monitoring service
        console.error('[ErrorBoundary]', error, info.componentStack);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <Box
                    sx={{
                        minHeight: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'background.default',
                        textAlign: 'center',
                        p: 3,
                    }}
                >
                    <ErrorOutline sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                        Erreur inattendue
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 1, maxWidth: 480 }}>
                        Une erreur est survenue dans l'application.
                        Veuillez rafraîchir la page ou réessayer.
                    </Typography>
                    {import.meta.env.DEV && this.state.error && (
                        <Typography
                            variant="body2"
                            color="error"
                            sx={{ mb: 3, fontFamily: 'monospace', maxWidth: 600 }}
                        >
                            {this.state.error.message}
                        </Typography>
                    )}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button variant="contained" onClick={this.handleReset}>
                            Réessayer
                        </Button>
                        <Button variant="outlined" onClick={() => window.location.assign('/')}>
                            Retour à l'accueil
                        </Button>
                    </Box>
                </Box>
            );
        }

        return this.props.children;
    }
}
