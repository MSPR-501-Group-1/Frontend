import { Box, Alert } from '@mui/material';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import PageHeader from '@/components/feedback/PageHeader';

export default function ValidationPage() {
    return (
        <Box>
            <PageHeader
                title="Validation des données"
                subtitle="Workflow de revue et validation avant intégration"
            />
            <Alert
                icon={<FactCheckIcon />}
                severity="info"
                sx={{ maxWidth: 600 }}
            >
                Cette page est en cours de construction. Elle hébergera le workflow
                complet de validation des données : file d'attente, revue manuelle,
                règles métier configurables et historique des décisions.
            </Alert>
        </Box>
    );
}
