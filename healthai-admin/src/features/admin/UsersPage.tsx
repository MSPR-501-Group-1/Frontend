import { useState, useMemo, useCallback } from 'react';
import {
    Box,
    Chip,
    Paper,
    Stack,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUsers, createUser } from '@/services/users.service';
import { LoadingState, ErrorState, PageHeader } from '@/components/feedback';
import { useAuthStore } from '@/stores/auth.store';
import { useNotificationStore } from '@/stores/notification.store';
import type { AdminUser, AccountStatus, CreateUserPayload } from '@/types';
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

// ─── Constants ──────────────────────────────────────────────

const USERS_KEY = ['admin-users'] as const;

const EMPTY_FORM: CreateUserPayload = {
    email: '',
    firstName: '',
    lastName: '',
    role: UserRole.DATA_ENGINEER,
};

// ─── Page ───────────────────────────────────────────────────

export default function UsersPage() {
    const queryClient = useQueryClient();
    const { notify } = useNotificationStore();
    const currentUser = useAuthStore((s) => s.user);
    const isAdmin = currentUser?.role === UserRole.ADMIN;

    // ── Create user dialog state ──
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState<CreateUserPayload>(EMPTY_FORM);
    const [touched, setTouched] = useState(false);

    const { data: users, isLoading, isError } = useQuery({
        queryKey: USERS_KEY,
        queryFn: fetchUsers,
    });

    // ── Create mutation ──
    const createMutation = useMutation({
        mutationFn: createUser,
        onSuccess: (newUser) => {
            queryClient.invalidateQueries({ queryKey: USERS_KEY });
            notify(`Utilisateur ${newUser.firstName} ${newUser.lastName} créé avec succès`, 'success');
            handleCloseDialog();
        },
        onError: () => notify('Erreur lors de la création de l\'utilisateur', 'error'),
    });

    // ── Form helpers ──
    const updateField = useCallback(<K extends keyof CreateUserPayload>(field: K, value: CreateUserPayload[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    }, []);

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    const isFormValid = form.firstName.trim().length > 0
        && form.lastName.trim().length > 0
        && isEmailValid;

    const handleOpenDialog = useCallback(() => {
        setForm(EMPTY_FORM);
        setTouched(false);
        setDialogOpen(true);
    }, []);

    const handleCloseDialog = useCallback(() => {
        setDialogOpen(false);
        setForm(EMPTY_FORM);
        setTouched(false);
    }, []);

    const handleSubmit = useCallback(() => {
        setTouched(true);
        if (!isFormValid) return;
        createMutation.mutate({
            ...form,
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            email: form.email.trim().toLowerCase(),
        });
    }, [form, isFormValid, createMutation]);

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
                actions={
                    isAdmin && (
                        <Button
                            variant="contained"
                            startIcon={<PersonAddIcon />}
                            onClick={handleOpenDialog}
                        >
                            Créer un utilisateur
                        </Button>
                    )
                }
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
                    aria-label="Tableau des utilisateurs"
                    initialState={{
                        sorting: { sortModel: [{ field: 'fullName', sort: 'asc' }] },
                        pagination: { paginationModel: { pageSize: 10 } },
                    }}
                    pageSizeOptions={[10, 25]}
                    disableRowSelectionOnClick
                    sx={{
                        border: 'none',
                        '& .MuiDataGrid-columnHeaders': {
                            bgcolor: 'action.hover',
                            fontWeight: 600,
                        },
                        '& .MuiDataGrid-cell': {
                            display: 'flex',
                            alignItems: 'center',
                        },
                    }}
                />
            </Paper>

            {/* Create User Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
                aria-labelledby="create-user-dialog"
            >
                <DialogTitle id="create-user-dialog">Créer un utilisateur</DialogTitle>
                <DialogContent>
                    <Stack spacing={2.5} sx={{ pt: 1 }}>
                        <Stack direction="row" spacing={2}>
                            <TextField
                                label="Prénom"
                                value={form.firstName}
                                onChange={(e) => updateField('firstName', e.target.value)}
                                error={touched && form.firstName.trim().length === 0}
                                helperText={touched && form.firstName.trim().length === 0 ? 'Obligatoire' : ''}
                                required
                                fullWidth
                            />
                            <TextField
                                label="Nom"
                                value={form.lastName}
                                onChange={(e) => updateField('lastName', e.target.value)}
                                error={touched && form.lastName.trim().length === 0}
                                helperText={touched && form.lastName.trim().length === 0 ? 'Obligatoire' : ''}
                                required
                                fullWidth
                            />
                        </Stack>

                        <TextField
                            label="Email"
                            type="email"
                            value={form.email}
                            onChange={(e) => updateField('email', e.target.value)}
                            error={touched && !isEmailValid}
                            helperText={touched && !isEmailValid ? 'Email invalide' : ''}
                            required
                            fullWidth
                            placeholder="prenom.nom@healthai.fr"
                        />

                        <FormControl fullWidth required>
                            <InputLabel>Rôle</InputLabel>
                            <Select
                                value={form.role}
                                label="Rôle"
                                onChange={(e) => updateField('role', e.target.value as UserRole)}
                            >
                                {Object.values(UserRole).map((role) => (
                                    <MenuItem key={role} value={role}>
                                        <Chip
                                            label={ROLE_LABELS[role]}
                                            color={ROLE_COLOR[role]}
                                            size="small"
                                            sx={{ fontWeight: 600 }}
                                        />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={handleCloseDialog} disabled={createMutation.isPending}>
                        Annuler
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={createMutation.isPending || (touched && !isFormValid)}
                    >
                        {createMutation.isPending ? 'Création…' : 'Créer le compte'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
