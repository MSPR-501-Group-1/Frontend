import { Typography, Box } from '@mui/material';

export default function DashboardPage() {
    return (
        <Box>
            <Typography variant="h4">Dashboard</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
                Vue d'ensemble des indicateurs clés (à venir Semaine 3)
            </Typography>
        </Box>
    );
}
