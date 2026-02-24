/**
 * Inline error alert — replaces the repeated pattern:
 *   if (isError) return <Alert severity="error" sx={{ m: 2 }}>…</Alert>;
 */

import { Alert } from '@mui/material';

interface ErrorStateProps {
    message?: string;
}

export default function ErrorState({
    message = 'Une erreur est survenue lors du chargement des données.',
}: ErrorStateProps) {
    return (
        <Alert severity="error" sx={{ m: 2 }}>
            {message}
        </Alert>
    );
}
