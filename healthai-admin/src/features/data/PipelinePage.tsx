import { Box, Typography, Alert } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import PageHeader from '@/components/feedback/PageHeader';

export default function PipelinePage() {
    return (
        <Box>
            <PageHeader
                title="Pipeline ETL"
                subtitle="Surveillance des flux d'ingestion et des connecteurs de données"
            />
            <Alert
                icon={<StorageIcon />}
                severity="info"
                sx={{ maxWidth: 600 }}
            >
                Cette page est en cours de construction. Elle affichera le monitoring
                temps réel du pipeline ETL (sources, débit, statut des connecteurs,
                file d'attente, historique des batchs).
            </Alert>
        </Box>
    );
}
