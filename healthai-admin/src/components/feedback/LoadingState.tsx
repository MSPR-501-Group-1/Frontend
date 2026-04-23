/**
 * Full-page centered loading spinner.
 *
 * Replaces the repeated pattern:
 *   if (isLoading) return <Box sx={{…}}><CircularProgress /></Box>;
 */

import { Box, CircularProgress } from '@mui/material';

interface LoadingStateProps {
    /** Vertical padding in spacing units. Default: 10. */
    py?: number;
}

export default function LoadingState({ py = 10 }: LoadingStateProps) {
    return (
        <Box
            role="status"
            aria-live="polite"
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5, py }}
        >
            <CircularProgress aria-hidden="true" />
            <Box
                component="span"
                sx={{
                    position: 'absolute',
                    width: 1,
                    height: 1,
                    p: 0,
                    m: -1,
                    overflow: 'hidden',
                    clip: 'rect(0 0 0 0)',
                    whiteSpace: 'nowrap',
                    border: 0,
                }}
            >
                Chargement en cours
            </Box>
        </Box>
    );
}
