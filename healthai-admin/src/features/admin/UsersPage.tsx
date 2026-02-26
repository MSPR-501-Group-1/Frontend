import { useMemo } from 'react';
import {
    Box,
    Chip,
    Paper,
    Stack,
    Button,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from '@/services/users.service';
import { LoadingState, ErrorState, PageHeader } from '@/components/feedback';
import { useAuthStore } from '@/stores/auth.store';
import type { AdminUser, AccountStatus } from '@/types';
import { UserRole, ROLE_LABELS } from '@/types';

// ─── Display config ─────────────────────────────────────────

const ROLE_COLOR: Record<UserRole, 'error' | 'warning' | 'info' | 'success' | 'default' | 'primary' | 'secondary'> = {
    [UserRole.ADMIN]: 'error',
    [UserRole.DATA_ENGINEER]: 'info',
    [UserRole.PRODUCT_OWNER]: 'warning',
    [UserRole.DIRECTION]: 'secondary',
    [UserRole.B2B_PARTNER]: 'primary',
};

const STATUS_CONFIG: Record<AccountStatus, { label: string; color: 'success' | 'default' | 'error' }> = {
    active: { label: 'Actif', color: 'success' },
    inactive: { label: 'Inactif', color: 'default' },
    suspended: { label: 'Suspendu', color: 'error' },
};

// ─── Page ───────────────────────────────────────────────────

export default function UsersPage() {
    const currentUser = useAuthStore((s) => s.user);
    const isAdmin = currentUser?.role === UserRole.ADMIN;

    const { data: users, isLoading, isError } = useQuery({
        queryKey: ['admin-users'],
        queryFn: fetchUsers,
    });

    // ── Stats ──
    const stats = useMemo(() => {
        if (!users) return { total: 0, active: 0, suspended: 0 };
        return {
            total: users.length,
            active: users.filter((u) => u.status === 'active').length,
            suspended: users.filter((u) => u.status === 'suspended').length,
        };
    }, [users]);

    // ── Columns ──
    const columns: GridColDef<AdminUser>[] = useMemo(() => [
        {
            field: 'fullName',
            headerName: 'Nom',
            width: 180,
            valueGetter: (_value: unknown, row: AdminUser) => `${row.firstName} ${row.lastName}`,
        },
        {
            field: 'email',
            headerName: 'Email',
            width: 220,
        },
        {
            field: 'role',
            headerName: 'Rôle',
            width: 160,
            renderCell: ({ value }) => {
                const role = value as UserRole;
                return (
                    <Chip
                        label={ROLE_LABELS[role]}
                        color={ROLE_COLOR[role]}
                        size="small"
                        sx={{ fontWeight: 600 }}
                    />
                );
            },
        },
        {
            field: 'status',
            headerName: 'Statut',
            width: 120,
            renderCell: ({ value }) => {
                const cfg = STATUS_CONFIG[value as AccountStatus];
                return <Chip label={cfg.label} color={cfg.color} size="small" variant="outlined" />;
            },
        },
        {
            field: 'createdAt',
            headerName: 'Créé le',
            width: 130,
            valueFormatter: (value: string) =>
                new Date(value).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                }),
        },
        {
            field: 'lastLogin',
            headerName: 'Dernière connexion',
            width: 160,
            valueFormatter: (value: string | null) => {
                if (!value) return 'Jamais';
                return new Date(value).toLocaleString('fr-FR', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                });
            },
        },
        ...(isAdmin
            ? [{
                field: 'actions' as const,
                headerName: 'Action',
                width: 120,
                sortable: false,
                filterable: false,
                renderCell: () => (
                    <Button size="small" variant="outlined">
                        Gérer
                    </Button>
                ),
            }]
            : []),
    ], [isAdmin]);

    // ── Loading / Error ──
    if (isLoading) return <LoadingState />;
    if (isError) return <ErrorState message="Erreur lors du chargement des utilisateurs." />;

    return (
        <Box>
            <PageHeader
                title="Utilisateurs & Rôles"
                subtitle="Gestion des comptes et des permissions d'accès"
            />

            {/* Stats */}
            <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
                <Chip label={`${stats.total} comptes`} variant="outlined" />
                <Chip label={`${stats.active} actifs`} color="success" variant="outlined" />
                <Chip label={`${stats.suspended} suspendus`} color="error" variant="outlined" />
            </Stack>

            {/* DataGrid */}
            <Paper elevation={0} sx={{ height: 560 }}>
                <DataGrid
                    rows={users ?? []}
                    columns={columns}
                    initialState={{
                        sorting: { sortModel: [{ field: 'fullName', sort: 'asc' }] },
                        pagination: { paginationModel: { pageSize: 10 } },
                    }}
                    pageSizeOptions={[10, 25]}
                    disableRowSelectionOnClick
                    sx={{
                        border: 'none',
                        '& .MuiDataGrid-columnHeaders': {
                            bgcolor: 'grey.50',
                            fontWeight: 600,
                        },
                        '& .MuiDataGrid-cell': {
                            display: 'flex',
                            alignItems: 'center',
                        },
                    }}
                />
            </Paper>
        </Box>
    );
}
