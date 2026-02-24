import { Box, Typography, Button } from '@mui/material';
import { Lock } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function ForbiddenPage() {
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
            <Lock sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
            <Typography variant="h3" fontWeight={700} gutterBottom>
                403
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                Accès refusé — vous n'avez pas les permissions nécessaires.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/')}>
                Retour au Dashboard
            </Button>
        </Box>
    );
}
