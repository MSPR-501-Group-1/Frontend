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
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import SyncIcon from '@mui/icons-material/Sync';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import { fetchPipelineRuns } from '@/services/pipeline.service';
import { LoadingState, ErrorState, PageHeader } from '@/components/feedback';
import { useNotificationStore } from '@/stores/notification.store';
import type { PipelineRun, PipelineStatus } from '@/types';
import { DataSource } from '@/types';

// ─── Display config ─────────────────────────────────────────

const STATUS_CONFIG: Record<PipelineStatus, {
    label: string;
    color: 'success' | 'error' | 'warning' | 'info';
    icon: React.ReactElement;
}> = {
    success: { label: 'Succès', color: 'success', icon: <CheckCircleOutlineIcon fontSize="small" /> },
    failed: { label: 'Échoué', color: 'error', icon: <ErrorOutlineIcon fontSize="small" /> },
    running: { label: 'En cours', color: 'info', icon: <SyncIcon fontSize="small" /> },
    pending: { label: 'En attente', color: 'warning', icon: <HourglassEmptyIcon fontSize="small" /> },
};

const SOURCE_LABELS: Record<DataSource, string> = {
    [DataSource.NUTRITION]: 'Nutrition',
    [DataSource.EXERCISES]: 'Exercices',
    [DataSource.USER_PROFILES]: 'Profils utilisateur',
    [DataSource.FITNESS_TRACKER]: 'Fitness Tracker',
    [DataSource.BIOMETRIC]: 'Biométrique',
};

function formatDuration(seconds: number): string {
    if (seconds === 0) return '—';
    if (seconds < 60) return `${seconds}s`;
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return sec > 0 ? `${min}m ${sec}s` : `${min}m`;
}

// ─── Page ───────────────────────────────────────────────────

type StatusFilter = 'all' | PipelineStatus;

export default function PipelinePage() {
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedRun, setSelectedRun] = useState<PipelineRun | null>(null);
    const [justification, setJustification] = useState('');
    const [dialogAction, setDialogAction] = useState<'approve' | 'reject'>('approve');

    const { data: runs, isLoading, isError } = useQuery({
        queryKey: ['pipeline-runs'],
        queryFn: fetchPipelineRuns,
        // Polling toutes les 15s — le pipeline nécessite un suivi plus fréquent
        // que le dashboard pour détecter rapidement les échecs d'ingestion
        refetchInterval: 15_000,
    });

    // ── Filtered data ──
    const filteredRows = useMemo(() => {
        if (!runs) return [];
        if (statusFilter === 'all') return runs;
        return runs.filter((r) => r.status === statusFilter);
    }, [runs, statusFilter]);

    // ── Stats ──
    const stats = useMemo(() => {
        if (!runs) return { total: 0, success: 0, failed: 0, running: 0 };
        return {
            total: runs.length,
            success: runs.filter((r) => r.status === 'success').length,
            failed: runs.filter((r) => r.status === 'failed').length,
            running: runs.filter((r) => r.status === 'running').length,
        };
    }, [runs]);

    // ── Handlers ──
    const handleOpenDialog = useCallback((run: PipelineRun, action: 'approve' | 'reject') => {
        setSelectedRun(run);
        setDialogAction(action);
        setJustification('');
        setDialogOpen(true);
    }, []);

    const handleConfirm = useCallback(() => {
        const action = dialogAction === 'approve' ? 'approuvé' : 'rejeté';
        useNotificationStore.getState().notify(`Pipeline ${action} avec succès`, 'success');
        setDialogOpen(false);
        setSelectedRun(null);
        setJustification('');
    }, [dialogAction]);

    // ── Columns ──
    const columns: GridColDef<PipelineRun>[] = useMemo(() => [
        {
            field: 'id',
            headerName: 'ID',
            width: 110,
        },
        {
            field: 'source',
            headerName: 'Source',
            width: 160,
            valueFormatter: (value: DataSource) => SOURCE_LABELS[value] || value,
        },
        {
            field: 'startedAt',
            headerName: 'Démarré le',
            width: 160,
            valueFormatter: (value: string) =>
                new Date(value).toLocaleString('fr-FR', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                }),
        },
        {
            field: 'duration',
            headerName: 'Durée',
            width: 100,
            valueFormatter: (value: number) => formatDuration(value),
        },
        {
            field: 'status',
            headerName: 'Statut',
            width: 130,
            renderCell: ({ value }) => {
                const cfg = STATUS_CONFIG[value as PipelineStatus];
                return (
                    <Chip
                        icon={cfg.icon}
                        label={cfg.label}
                        color={cfg.color}
                        size="small"
                        sx={{ fontWeight: 600 }}
                    />
                );
            },
        },
        {
            field: 'recordsProcessed',
            headerName: 'Traités',
            width: 100,
            valueFormatter: (value: number) => value.toLocaleString('fr-FR'),
        },
        {
            field: 'recordsFailed',
            headerName: 'Échoués',
            width: 100,
            renderCell: ({ value }) => (
                <Typography
                    variant="body2"
                    color={value > 0 ? 'error' : 'text.secondary'}
                    fontWeight={value > 0 ? 600 : 400}
                >
                    {(value as number).toLocaleString('fr-FR')}
                </Typography>
            ),
        },
        {
            field: 'triggeredBy',
            headerName: 'Déclenché par',
            width: 160,
        },
        {
            field: 'actions',
            headerName: 'Validation',
            width: 200,
            sortable: false,
            filterable: false,
            renderCell: ({ row }) => {
                if (row.status !== 'success' && row.status !== 'failed') return null;
                return (
                    <Stack direction="row" spacing={1}>
                        <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            onClick={() => handleOpenDialog(row, 'approve')}
                        >
                            Valider
                        </Button>
                        <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleOpenDialog(row, 'reject')}
                        >
                            Rejeter
                        </Button>
                    </Stack>
                );
            },
        },
    ], [handleOpenDialog]);

    // ── Loading / Error ──
    if (isLoading) return <LoadingState />;
    if (isError) return <ErrorState message="Erreur lors du chargement du pipeline ETL." />;

    return (
        <Box>
            <PageHeader
                title="Pipeline ETL"
                subtitle="Surveillance des flux d'ingestion et historique des exécutions"
            />

            {/* Stats */}
            <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
                <Chip label={`${stats.total} exécutions`} variant="outlined" />
                <Chip label={`${stats.success} succès`} color="success" variant="outlined" />
                <Chip label={`${stats.failed} échoués`} color="error" variant="outlined" />
                <Chip label={`${stats.running} en cours`} color="info" variant="outlined" />
            </Stack>

            {/* Filter */}
            <Paper elevation={0} sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel>Statut</InputLabel>
                    <Select
                        value={statusFilter}
                        label="Statut"
                        onChange={(e: SelectChangeEvent) => setStatusFilter(e.target.value as StatusFilter)}
                    >
                        <MenuItem value="all">Tous les statuts</MenuItem>
                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                            <MenuItem key={key} value={key}>{cfg.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Typography variant="body2" color="text.secondary">
                    {filteredRows.length} exécution{filteredRows.length > 1 ? 's' : ''} affichée{filteredRows.length > 1 ? 's' : ''}
                </Typography>
            </Paper>

            {/* DataGrid */}
            <Paper elevation={0} sx={{ height: 560 }}>
                <DataGrid
                    rows={filteredRows}
                    columns={columns}
                    aria-label="Tableau des exécutions du pipeline ETL"
                    initialState={{
                        sorting: { sortModel: [{ field: 'startedAt', sort: 'desc' }] },
                        pagination: { paginationModel: { pageSize: 10 } },
                    }}
                    pageSizeOptions={[10, 25, 50]}
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

            {/* Validation Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {dialogAction === 'approve' ? 'Valider' : 'Rejeter'} le batch {selectedRun?.id}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Source : {selectedRun ? SOURCE_LABELS[selectedRun.source] : ''}
                        {' — '}
                        {selectedRun?.recordsProcessed.toLocaleString('fr-FR')} enregistrements traités
                    </Typography>
                    {selectedRun?.errorMessage && (
                        <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                            Erreur : {selectedRun.errorMessage}
                        </Typography>
                    )}
                    <TextField
                        autoFocus
                        fullWidth
                        multiline
                        rows={3}
                        label="Justification"
                        placeholder="Motivez votre décision…"
                        value={justification}
                        onChange={(e) => setJustification(e.target.value)}
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Annuler</Button>
                    <Button
                        variant="contained"
                        color={dialogAction === 'approve' ? 'success' : 'error'}
                        disabled={!justification.trim()}
                        onClick={handleConfirm}
                    >
                        {dialogAction === 'approve' ? 'Valider' : 'Rejeter'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
