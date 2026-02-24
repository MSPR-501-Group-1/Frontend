import { Box, Alert } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PageHeader from '@/components/feedback/PageHeader';

export default function BusinessPage() {
    return (
        <Box>
            <PageHeader
                title="KPIs Business"
                subtitle="Indicateurs stratégiques d'engagement, de rétention et de performance B2B"
            />
            <Alert
                icon={<TrendingUpIcon />}
                severity="info"
                sx={{ maxWidth: 600 }}
            >
                Cette page est en cours de construction. Elle présentera les KPIs
                business clés : DAU/MAU, taux de rétention par cohortes, NPS,
                adoption des fonctionnalités et performance des partenaires B2B.
            </Alert>
        </Box>
    );
}
