import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingScreenProps {
    message?: string;
}

/**
 * Full-page loading screen utilisé par les Suspense boundaries (lazy routes).
 */
export default function LoadingScreen({ message = 'Chargement…' }: LoadingScreenProps) {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                gap: 2,
            }}
        >
            <CircularProgress size={40} />
            <Typography variant="body2" color="text.secondary">
                {message}
            </Typography>
        </Box>
    );
}
