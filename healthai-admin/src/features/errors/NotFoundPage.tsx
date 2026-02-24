/**
 * 404 Not Found page — proper React component replacing the inline JSX in routes.
 */

import { Box, Typography, Button } from '@mui/material';
import { SearchOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
    const navigate = useNavigate();

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
            <SearchOff sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h3" fontWeight={700} gutterBottom>
                404
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                Page introuvable — cette ressource n'existe pas.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/')}>
                Retour au Dashboard
            </Button>
        </Box>
    );
}
