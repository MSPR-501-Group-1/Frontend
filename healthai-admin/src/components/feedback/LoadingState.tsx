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
        <Box sx={{ display: 'flex', justifyContent: 'center', py }}>
            <CircularProgress />
        </Box>
    );
}
