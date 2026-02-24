import { Box, Alert } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import PageHeader from '@/components/feedback/PageHeader';

export default function PartnersPage() {
    return (
        <Box>
            <PageHeader
                title="Partenaires B2B"
                subtitle="Suivi et pilotage des accès et indicateurs partenaires"
            />
            <Alert
                icon={<BusinessIcon />}
                severity="info"
                sx={{ maxWidth: 600 }}
            >
                Cette page est en cours de construction. Elle permettra la gestion
                des partenaires B2B (gyms, assurances, mutuelles) : dashboards
                agrégés, gestion des droits d'accès et rapports partenaires.
            </Alert>
        </Box>
    );
}
