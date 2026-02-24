/**
 * Empty state illustration — displayed when a data list is empty.
 */

import { Box, Typography } from '@mui/material';
import { InboxOutlined } from '@mui/icons-material';

interface EmptyStateProps {
    message?: string;
}

export default function EmptyState({
    message = 'Aucune donnée à afficher.',
}: EmptyStateProps) {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 8,
                color: 'text.secondary',
            }}
        >
            <InboxOutlined sx={{ fontSize: 64, mb: 2, opacity: 0.4 }} />
            <Typography variant="body1">{message}</Typography>
        </Box>
    );
}
