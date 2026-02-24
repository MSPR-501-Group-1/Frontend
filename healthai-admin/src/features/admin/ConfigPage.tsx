import { Box, Alert } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import PageHeader from '@/components/feedback/PageHeader';

export default function ConfigPage() {
    return (
        <Box>
            <PageHeader
                title="Configuration"
                subtitle="Paramétrage système : seuils, règles métier et intégrations"
            />
            <Alert
                icon={<SettingsIcon />}
                severity="info"
                sx={{ maxWidth: 600 }}
            >
                Cette page est en cours de construction. Elle hébergera le
                paramétrage des seuils d'alerte qualité, des règles de validation
                physio­logique, des connecteurs API et des politiques de rétention.
            </Alert>
        </Box>
    );
}
