import { Box, Alert } from '@mui/material';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import PageHeader from '@/components/feedback/PageHeader';

export default function UsersPage() {
    return (
        <Box>
            <PageHeader
                title="Utilisateurs & Rôles"
                subtitle="Gestion des comptes et des permissions d'accès"
            />
            <Alert
                icon={<ManageAccountsIcon />}
                severity="info"
                sx={{ maxWidth: 600 }}
            >
                Cette page est en cours de construction. Elle permettra la gestion
                complète des utilisateurs : création de comptes, attribution de rôles
                (RBAC), désactivation et historique des modifications.
            </Alert>
        </Box>
    );
}
