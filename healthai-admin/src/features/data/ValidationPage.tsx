/**
 * ValidationPage — batch review workflow for ETL CSV OK/KO output.
 *
 * Workflow (Approach A — CSV intermédiaires):
 *   1. ETL Spark produit ok.csv + ko.csv par run
 *   2. Backend expose les batches via API REST
 *   3. L'admin review chaque batch ici :
 *      - Approuver → Backend insère ok.csv dans PostgreSQL
 *      - Rejeter  → ETL re-traite ko.csv corrigé
 *
 * Architecture layers:
 *   types/ → mocks/ → services/ → [useQuery/useMutation] → this page
 */

import { useState, useMemo, useCallback } from 'react';
import {
    Box, Grid, Chip, Paper, Stack, Button, Tabs, Tab,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Typography, Tooltip,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import RateReviewIcon from '@mui/icons-material/RateReview';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    fetchValidationBatches,
    fetchValidationSummary,
    approveBatch,
    rejectBatch,
} from '@/services/validation.service';
import KPICard from '@/components/dashboard/KPICard';
import { LoadingState, ErrorState, PageHeader, ExportButton } from '@/components/feedback';
import { useNotificationStore } from '@/stores/notification.store';
import type { ExportColumn } from '@/lib/export.utils';
import { DataSource, ValidationStatus } from '@/types';
import type { ValidationBatch } from '@/types';

// ─── Display config (SRP: visual mapping isolated from logic) ──

const STATUS_CONFIG: Record<ValidationStatus, {
    label: string;
    color: 'success' | 'error' | 'warning' | 'info' | 'default';
    icon: React.ReactElement;
}> = {
    [ValidationStatus.PENDING]: { label: 'En attente', color: 'warning', icon: <HourglassEmptyIcon fontSize="small" /> },
    [ValidationStatus.IN_REVIEW]: { label: 'En revue', color: 'info', icon: <RateReviewIcon fontSize="small" /> },
    [ValidationStatus.APPROVED]: { label: 'Approuvé', color: 'success', icon: <CheckCircleOutlineIcon fontSize="small" /> },
    [ValidationStatus.REJECTED]: { label: 'Rejeté', color: 'error', icon: <CancelOutlinedIcon fontSize="small" /> },
    [ValidationStatus.CORRECTED]: { label: 'Corrigé', color: 'default', icon: <BuildCircleIcon fontSize="small" /> },
};

const SOURCE_LABELS: Record<DataSource, string> = {
    [DataSource.NUTRITION]: 'Nutrition',
    [DataSource.EXERCISES]: 'Exercices',
    [DataSource.USER_PROFILES]: 'Profils utilisateur',
    [DataSource.FITNESS_TRACKER]: 'Fitness Tracker',
    [DataSource.BIOMETRIC]: 'Biométrique',
};

// ─── Export columns (DRY: declared once, used for CSV & PDF) ──

const EXPORT_COLUMNS: ExportColumn[] = [
    { field: 'id', headerName: 'ID' },
    { field: 'source', headerName: 'Source' },
    { field: 'receivedAt', headerName: 'Date réception' },
    { field: 'okRecordCount', headerName: 'Records OK' },
    { field: 'koRecordCount', headerName: 'Records KO' },
    { field: 'status', headerName: 'Statut' },
    { field: 'reviewer', headerName: 'Reviewer' },
    { field: 'comment', headerName: 'Commentaire' },
];

// ─── Query keys (DRY: single source of truth) ──────────────

const BATCHES_KEY = ['validation-batches'] as const;
const SUMMARY_KEY = ['validation-summary'] as const;

// ─── Tab mapping ────────────────────────────────────────────

const TAB_FILTERS: (ValidationStatus | 'all')[] = [
    'all',
    ValidationStatus.PENDING,
    ValidationStatus.IN_REVIEW,
    ValidationStatus.APPROVED,
    ValidationStatus.REJECTED,
    ValidationStatus.CORRECTED,
];

const TAB_LABELS = ['Tous', 'En attente', 'En revue', 'Approuvés', 'Rejetés', 'Corrigés'];

// ─── Page ───────────────────────────────────────────────────

export default function ValidationPage() {
    const queryClient = useQueryClient();
    const { notify } = useNotificationStore();

    const [tabIndex, setTabIndex] = useState(0);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<ValidationBatch | null>(null);
    const [dialogAction, setDialogAction] = useState<'approve' | 'reject'>('approve');
    const [comment, setComment] = useState('');

    // ── Fetch ──
    const { data: batches, isLoading: batchesLoading, isError: batchesError } = useQuery({
        queryKey: BATCHES_KEY,
        queryFn: fetchValidationBatches,
        refetchInterval: 20_000, // polling 20s — suivi quasi temps réel des nouveaux batches ETL
    });

    const { data: summary } = useQuery({
        queryKey: SUMMARY_KEY,
        queryFn: fetchValidationSummary,
        refetchInterval: 20_000,
    });

    // ── Filtered rows ──
    const filteredBatches = useMemo(() => {
        if (!batches) return [];
        const filter = TAB_FILTERS[tabIndex];
        if (filter === 'all') return batches;
        return batches.filter((b) => b.status === filter);
    }, [batches, tabIndex]);

    // ── Mutations (SRP: each handles one action) ──
    const approveMutation = useMutation({
        mutationFn: ({ id, comment }: { id: string; comment: string }) =>
            approveBatch(id, comment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: BATCHES_KEY });
            queryClient.invalidateQueries({ queryKey: SUMMARY_KEY });
            notify('Batch approuvé — insertion ok.csv en base lancée', 'success');
            setDialogOpen(false);
        },
        onError: () => notify('Erreur lors de l\'approbation du batch', 'error'),
    });

    const rejectMutation = useMutation({
        mutationFn: ({ id, comment }: { id: string; comment: string }) =>
            rejectBatch(id, comment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: BATCHES_KEY });
            queryClient.invalidateQueries({ queryKey: SUMMARY_KEY });
            notify('Batch rejeté — re-soumission ETL requise', 'warning');
            setDialogOpen(false);
        },
        onError: () => notify('Erreur lors du rejet du batch', 'error'),
    });

    // ── Handlers ──
    const handleOpenDialog = useCallback((batch: ValidationBatch, action: 'approve' | 'reject') => {
        setSelectedBatch(batch);
        setDialogAction(action);
        setComment('');
        setDialogOpen(true);
    }, []);

    const handleConfirm = useCallback(() => {
        if (!selectedBatch) return;
        if (dialogAction === 'approve') {
            approveMutation.mutate({ id: selectedBatch.id, comment });
        } else {
            rejectMutation.mutate({ id: selectedBatch.id, comment });
        }
    }, [selectedBatch, dialogAction, comment, approveMutation, rejectMutation]);

    const isPending = approveMutation.isPending || rejectMutation.isPending;

    // ── DataGrid columns ──
    const columns: GridColDef<ValidationBatch>[] = useMemo(() => [
        { field: 'id', headerName: 'Batch', width: 110 },
        {
            field: 'source',
            headerName: 'Source ETL',
            width: 150,
            valueFormatter: (v: DataSource) => SOURCE_LABELS[v] || v,
        },
        {
            field: 'receivedAt',
            headerName: 'Réception',
            width: 155,
            valueFormatter: (v: string) =>
                new Date(v).toLocaleString('fr-FR', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                }),
        },
        {
            field: 'okRecordCount',
            headerName: 'OK (ok.csv)',
            width: 120,
            renderCell: ({ value }) => (
                <Tooltip title="Enregistrements valides dans ok.csv">
                    <Chip
                        icon={<InsertDriveFileIcon sx={{ fontSize: 14 }} />}
                        label={(value as number).toLocaleString('fr-FR')}
                        color="success"
                        size="small"
                        variant="outlined"
                    />
                </Tooltip>
            ),
        },
        {
            field: 'koRecordCount',
            headerName: 'KO (ko.csv)',
            width: 120,
            renderCell: ({ value }) => (
                <Tooltip title="Enregistrements en anomalie dans ko.csv">
                    <Chip
                        icon={<InsertDriveFileIcon sx={{ fontSize: 14 }} />}
                        label={(value as number).toLocaleString('fr-FR')}
                        color="error"
                        size="small"
                        variant="outlined"
                    />
                </Tooltip>
            ),
        },
        {
            field: 'status',
            headerName: 'Statut',
            width: 130,
            renderCell: ({ value }) => {
                const cfg = STATUS_CONFIG[value as ValidationStatus];
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
            field: 'reviewer',
            headerName: 'Reviewer',
            width: 170,
            valueFormatter: (v: string | undefined) => v || '—',
        },
        {
            field: 'okFileName',
            headerName: 'Fichier OK',
            width: 220,
            renderCell: ({ value }) => (
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                    {value as string}
                </Typography>
            ),
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 220,
            sortable: false,
            filterable: false,
            renderCell: ({ row }) => {
                // Only pending and in_review batches can be acted upon
                if (row.status !== ValidationStatus.PENDING && row.status !== ValidationStatus.IN_REVIEW) {
                    return row.comment ? (
                        <Tooltip title={row.comment}>
                            <Typography variant="caption" color="text.secondary" noWrap>
                                {row.comment}
                            </Typography>
                        </Tooltip>
                    ) : null;
                }
                return (
                    <Stack direction="row" spacing={1}>
                        <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            onClick={() => handleOpenDialog(row, 'approve')}
                            aria-label={`Approuver le batch ${row.id}`}
                        >
                            Approuver
                        </Button>
                        <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleOpenDialog(row, 'reject')}
                            aria-label={`Rejeter le batch ${row.id}`}
                        >
                            Rejeter
                        </Button>
                    </Stack>
                );
            },
        },
    ], [handleOpenDialog]);

    // ── Loading / Error ──
    if (batchesLoading) return <LoadingState />;
    if (batchesError) return <ErrorState message="Erreur lors du chargement des batches de validation." />;

    return (
        <Box>
            <PageHeader
                title="Validation des données"
                subtitle="Workflow de revue des lots ETL — ok.csv / ko.csv (Approche A)"
                actions={
                    <ExportButton
                        fileName="validation-batches"
                        title="Validation — Batches ETL"
                        columns={EXPORT_COLUMNS}
                        rows={filteredBatches as unknown as Record<string, unknown>[]}
                    />
                }
            />

            {/* KPI Summary Cards */}
            {summary && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                        <KPICard label="En attente" value={summary.pending} status={summary.pending > 0 ? 'warning' : 'success'} />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                        <KPICard label="En revue" value={summary.inReview} status="warning" />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                        <KPICard label="Approuvés" value={summary.approved} status="success" />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                        <KPICard label="Rejetés" value={summary.rejected} status="error" />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                        <KPICard label="Corrigés" value={summary.corrected} status="success" />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                        <KPICard label="Total batches" value={summary.total} status="success" />
                    </Grid>
                </Grid>
            )}

            {/* Status tabs */}
            <Tabs
                value={tabIndex}
                onChange={(_, v) => setTabIndex(v)}
                sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
                aria-label="Filtrer par statut de validation"
            >
                {TAB_LABELS.map((label, i) => (
                    <Tab
                        key={label}
                        label={
                            <Stack direction="row" spacing={0.5} alignItems="center">
                                <span>{label}</span>
                                {summary && i > 0 && (
                                    <Chip
                                        label={[
                                            0, // "all" — not shown
                                            summary.pending,
                                            summary.inReview,
                                            summary.approved,
                                            summary.rejected,
                                            summary.corrected,
                                        ][i]}
                                        size="small"
                                        sx={{ height: 20, fontSize: 11 }}
                                    />
                                )}
                            </Stack>
                        }
                    />
                ))}
            </Tabs>

            {/* Batch count */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {filteredBatches.length} batch{filteredBatches.length > 1 ? 'es' : ''} affiché{filteredBatches.length > 1 ? 's' : ''}
            </Typography>

            {/* DataGrid */}
            <Paper elevation={0} sx={{ height: 520, mb: 3 }}>
                <DataGrid
                    rows={filteredBatches}
                    columns={columns}
                    aria-label="Tableau des batches de validation ETL"
                    initialState={{
                        sorting: { sortModel: [{ field: 'receivedAt', sort: 'desc' }] },
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

            {/* Approve / Reject Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                aria-labelledby="validation-dialog-title"
            >
                <DialogTitle id="validation-dialog-title">
                    {dialogAction === 'approve' ? 'Approuver' : 'Rejeter'} le batch {selectedBatch?.id}
                </DialogTitle>
                <DialogContent>
                    {selectedBatch && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Source : <strong>{SOURCE_LABELS[selectedBatch.source]}</strong>
                            </Typography>
                            <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                                <Chip
                                    label={`${selectedBatch.okRecordCount.toLocaleString('fr-FR')} records OK`}
                                    color="success"
                                    size="small"
                                    variant="outlined"
                                />
                                <Chip
                                    label={`${selectedBatch.koRecordCount.toLocaleString('fr-FR')} records KO`}
                                    color="error"
                                    size="small"
                                    variant="outlined"
                                />
                            </Stack>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                Fichiers : {selectedBatch.okFileName} / {selectedBatch.koFileName}
                            </Typography>
                        </Box>
                    )}

                    {dialogAction === 'approve' ? (
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            En approuvant ce batch, les <strong>{selectedBatch?.okRecordCount.toLocaleString('fr-FR')}</strong> enregistrements
                            de <strong>{selectedBatch?.okFileName}</strong> seront insérés en base PostgreSQL.
                        </Typography>
                    ) : (
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            En rejetant ce batch, le fichier <strong>{selectedBatch?.koFileName}</strong> sera
                            re-soumis au pipeline ETL pour correction et re-traitement.
                        </Typography>
                    )}

                    <TextField
                        autoFocus
                        fullWidth
                        multiline
                        rows={3}
                        label="Commentaire obligatoire"
                        placeholder={
                            dialogAction === 'approve'
                                ? 'Justifiez l\'approbation du lot…'
                                : 'Décrivez les anomalies justifiant le rejet…'
                        }
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)} disabled={isPending}>
                        Annuler
                    </Button>
                    <Button
                        variant="contained"
                        color={dialogAction === 'approve' ? 'success' : 'error'}
                        disabled={!comment.trim() || isPending}
                        onClick={handleConfirm}
                    >
                        {isPending
                            ? 'Traitement…'
                            : dialogAction === 'approve'
                                ? 'Approuver → Insérer en BDD'
                                : 'Rejeter → Re-soumettre ETL'
                        }
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
