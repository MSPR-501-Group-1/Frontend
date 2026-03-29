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
import { fetchUsers, createUser, updateUserRole } from '@/services/users.service';
import { LoadingState, ErrorState, PageHeader } from '@/components/feedback';
import { useAuthStore } from '@/stores/auth.store';
import { useNotificationStore } from '@/stores/notification.store';
import type { AdminUser, CreateUserPayload } from '@/types';
import { UserRole, ROLE_LABELS } from '@/types';

// ─── Display config ─────────────────────────────────────────

const ROLE_COLOR: Record<UserRole, 'error' | 'warning' | 'info' | 'success' | 'default' | 'primary' | 'secondary'> = {
    [UserRole.FREEMIUM]: 'default',
    [UserRole.PREMIUM]: 'primary',
    [UserRole.PREMIUM_PLUS]: 'secondary',
    [UserRole.B2B]: 'info',
    [UserRole.ADMIN]: 'error',
};

const STATUS_CONFIG: Record<'active' | 'inactive', { label: string; color: 'success' | 'default' }> = {
    active: { label: 'Actif', color: 'success' },
    inactive: { label: 'Inactif', color: 'default' },
};

// ─── Constants ──────────────────────────────────────────────

const USERS_KEY = ['admin-users'] as const;

const EMPTY_FORM: CreateUserPayload = {
    email: '',
    first_name: '',
    last_name: '',
    role_type: UserRole.FREEMIUM,
    password: '',
};

// ─── Page ───────────────────────────────────────────────────

export default function UsersPage() {
    const queryClient = useQueryClient();
    const { notify } = useNotificationStore();
    const currentUser = useAuthStore((s) => s.user);
    const isAdmin = currentUser?.role_type === UserRole.ADMIN;

    // ── Create user dialog state ──
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState<CreateUserPayload>(EMPTY_FORM);
    const [touched, setTouched] = useState(false);
    const [managedUser, setManagedUser] = useState<AdminUser | null>(null);
    const [managedRole, setManagedRole] = useState<UserRole>(UserRole.FREEMIUM);

    const { data: users, isLoading, isError } = useQuery({
        queryKey: USERS_KEY,
        queryFn: fetchUsers,
    });

    // ── Create mutation ──
    const createMutation = useMutation({
        mutationFn: createUser,
        onSuccess: (newUser) => {
            queryClient.invalidateQueries({ queryKey: USERS_KEY });
            notify(`Utilisateur ${newUser.first_name} ${newUser.last_name} créé avec succès`, 'success');
            handleCloseDialog();
        },
        onError: () => notify('Erreur lors de la création de l\'utilisateur', 'error'),
    });

    const updateRoleMutation = useMutation({
        mutationFn: ({ userId, roleType }: { userId: string; roleType: UserRole }) =>
            updateUserRole(userId, roleType),
        onSuccess: (updatedUser) => {
            queryClient.invalidateQueries({ queryKey: USERS_KEY });
            setManagedUser(updatedUser);
            setManagedRole(updatedUser.role_type);
            notify(`Rôle mis à jour pour ${updatedUser.first_name} ${updatedUser.last_name}`, 'success');
        },
        onError: () => notify('Erreur lors de la mise à jour du rôle', 'error'),
    });

    // ── Form helpers ──
    const updateField = useCallback(<K extends keyof CreateUserPayload>(field: K, value: CreateUserPayload[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    }, []);

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    const isPasswordValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(form.password);
    const isFormValid = form.first_name.trim().length > 0
        && form.last_name.trim().length > 0
        && isEmailValid
        && isPasswordValid;

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

    const handleOpenManageDialog = useCallback((user: AdminUser) => {
        setManagedUser(user);
        setManagedRole(user.role_type);
    }, []);

    const handleCloseManageDialog = useCallback(() => {
        setManagedUser(null);
        setManagedRole(UserRole.FREEMIUM);
    }, []);

    const handleSaveManagedRole = useCallback(() => {
        if (!managedUser) return;
        updateRoleMutation.mutate({
            userId: managedUser.user_id,
            roleType: managedRole,
        });
    }, [managedUser, managedRole, updateRoleMutation]);

    const handleSubmit = useCallback(() => {
        setTouched(true);
        if (!isFormValid) return;
        createMutation.mutate({
            ...form,
            first_name: form.first_name.trim(),
            last_name: form.last_name.trim(),
            email: form.email.trim().toLowerCase(),
        });
    }, [form, isFormValid, createMutation]);

    // ── Stats ──
    const stats = useMemo(() => {
        if (!users) return { total: 0, active: 0, inactive: 0 };
        return {
            total: users.length,
            active: users.filter((u) => u.is_active).length,
            inactive: users.filter((u) => !u.is_active).length,
        };
    }, [users]);

    // ── Columns ──
    const columns: GridColDef<AdminUser>[] = useMemo(() => [
        {
            field: 'fullName',
            headerName: 'Nom',
            width: 180,
            valueGetter: (_value: unknown, row: AdminUser) => `${row.first_name} ${row.last_name}`,
        },
        {
            field: 'email',
            headerName: 'Email',
            width: 220,
        },
        {
            field: 'role_type',
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
            field: 'is_active',
            headerName: 'Statut',
            width: 120,
            renderCell: ({ value }) => {
                const cfg = STATUS_CONFIG[(value as boolean) ? 'active' : 'inactive'];
                return <Chip label={cfg.label} color={cfg.color} size="small" variant="outlined" />;
            },
        },
        {
            field: 'created_at',
            headerName: 'Créé le',
            width: 130,
            valueFormatter: (value: string) =>
                new Date(value).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                }),
        },
        ...(isAdmin
            ? [{
                field: 'actions' as const,
                headerName: 'Action',
                width: 120,
                sortable: false,
                filterable: false,
                renderCell: ({ row }: { row: AdminUser }) => (
                    <Button size="small" variant="outlined" onClick={() => handleOpenManageDialog(row)}>
                        Gérer
                    </Button>
                ),
            }]
            : []),
    ], [isAdmin, handleOpenManageDialog]);

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
                <Chip label={`${stats.inactive} inactifs`} color="default" variant="outlined" />
            </Stack>

            {/* DataGrid */}
            <Paper elevation={0} sx={{ height: 560 }}>
                <DataGrid
                    rows={users ?? []}
                    getRowId={(row) => row.user_id}
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
                                value={form.first_name}
                                onChange={(e) => updateField('first_name', e.target.value)}
                                error={touched && form.first_name.trim().length === 0}
                                helperText={touched && form.first_name.trim().length === 0 ? 'Obligatoire' : ''}
                                required
                                fullWidth
                            />
                            <TextField
                                label="Nom"
                                value={form.last_name}
                                onChange={(e) => updateField('last_name', e.target.value)}
                                error={touched && form.last_name.trim().length === 0}
                                helperText={touched && form.last_name.trim().length === 0 ? 'Obligatoire' : ''}
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

                        <TextField
                            label="Mot de passe"
                            type="password"
                            value={form.password}
                            onChange={(e) => updateField('password', e.target.value)}
                            error={touched && !isPasswordValid}
                            helperText={touched && !isPasswordValid
                                ? '8+ caractères, avec majuscule, minuscule et chiffre'
                                : ''}
                            required
                            fullWidth
                        />

                        <FormControl fullWidth required>
                            <InputLabel>Rôle</InputLabel>
                            <Select
                                value={form.role_type}
                                label="Rôle"
                                onChange={(e) => updateField('role_type', e.target.value as UserRole)}
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

            {/* Manage User Dialog */}
            <Dialog
                open={Boolean(managedUser)}
                onClose={handleCloseManageDialog}
                maxWidth="sm"
                fullWidth
                aria-labelledby="manage-user-dialog"
            >
                <DialogTitle id="manage-user-dialog">Gérer l'utilisateur</DialogTitle>
                <DialogContent>
                    <Stack spacing={2.5} sx={{ pt: 1 }}>
                        <TextField
                            label="Identifiant"
                            value={managedUser?.user_id ?? ''}
                            InputProps={{ readOnly: true }}
                            fullWidth
                        />
                        <TextField
                            label="Email"
                            value={managedUser?.email ?? ''}
                            InputProps={{ readOnly: true }}
                            fullWidth
                        />
                        <Stack direction="row" spacing={2}>
                            <TextField
                                label="Prénom"
                                value={managedUser?.first_name ?? ''}
                                InputProps={{ readOnly: true }}
                                fullWidth
                            />
                            <TextField
                                label="Nom"
                                value={managedUser?.last_name ?? ''}
                                InputProps={{ readOnly: true }}
                                fullWidth
                            />
                        </Stack>
                        <Stack direction="row" spacing={1.5}>
                            <Chip
                                label={ROLE_LABELS[managedRole]}
                                color={ROLE_COLOR[managedRole]}
                                size="small"
                            />
                            <Chip
                                label={managedUser?.is_active ? 'Actif' : 'Inactif'}
                                color={managedUser?.is_active ? 'success' : 'default'}
                                size="small"
                                variant="outlined"
                            />
                        </Stack>

                        <FormControl fullWidth>
                            <InputLabel id="manage-user-role-label">Rôle</InputLabel>
                            <Select
                                labelId="manage-user-role-label"
                                value={managedRole}
                                label="Rôle"
                                onChange={(e) => setManagedRole(e.target.value as UserRole)}
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
                    <Button onClick={handleCloseManageDialog} disabled={updateRoleMutation.isPending}>
                        Fermer
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveManagedRole}
                        disabled={!managedUser || managedRole === managedUser.role_type || updateRoleMutation.isPending}
                    >
                        {updateRoleMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
