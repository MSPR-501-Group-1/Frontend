/**
 * ValidationPage — Admin editing workspace for ETL ko.csv records.
 *
 * Architecture (Approach A — CSV intermédiaires):
 *   Pipeline ETL (historique, lecture seule) → produit ok.csv + ko.csv
 *   Validation (CETTE PAGE) → Admin drill-down sur les records KO, édition
 *   inline des valeurs, puis approbation / rejet du batch.
 *
 * Layout master-detail :
 *   ┌─────────────────────────────────────────────────────┐
 *   │ KPI Summary  │  Tabs de filtrage par statut         │
 *   ├─────────────────────────────────────────────────────┤
 *   │ Batch list (selectable DataGrid)                    │
 *   ├─────────────────────────────────────────────────────┤
 *   │ Detail Panel ── ko.csv records  (editable DataGrid) │
 *   │   → Inline edit correctedValue                      │
 *   │   → Dismiss / Correct actions per record            │
 *   │   → Approve / Reject batch after review             │
 *   └─────────────────────────────────────────────────────┘
 */

import { useState, useMemo, useCallback } from 'react';
import {
    Box, Chip, Paper, Stack, Button,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Typography, Tooltip, Divider, Alert,
    IconButton,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import RateReviewIcon from '@mui/icons-material/RateReview';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import type { GridColDef } from '@mui/x-data-grid';
import { DataTable, KPIGrid, FilterBar } from '@/components/shared';
import { formatDateTime, formatNumber } from '@/lib/formatters';
import { SOURCE_LABELS } from '@/lib/labels.constants';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    fetchValidationBatches,
    fetchValidationSummary,
    fetchBatchRecords,
    approveBatch,
    rejectBatch,
    updateRecord,
    dismissRecord,
} from '@/services/validation.service';
import { LoadingState, ErrorState, PageHeader, ExportButton, EmptyState } from '@/components/feedback';
import { useNotificationStore } from '@/stores/notification.store';
import type { ExportColumn } from '@/lib/export.utils';
import { DataSource, ValidationStatus } from '@/types';
import type { ValidationBatch, ValidationRecord } from '@/types';

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

const RECORD_STATUS_MAP: Record<ValidationRecord['validationStatus'], {
    label: string; color: 'error' | 'success' | 'default';
}> = {
    flagged: { label: 'Flaggé', color: 'error' },
    corrected: { label: 'Corrigé', color: 'success' },
    dismissed: { label: 'Ignoré', color: 'default' },
};



// ─── Export columns ─────────────────────────────────────────

const BATCH_EXPORT_COLUMNS: ExportColumn[] = [
    { field: 'id', headerName: 'Batch' },
    { field: 'source', headerName: 'Source' },
    { field: 'receivedAt', headerName: 'Réception' },
    { field: 'okRecordCount', headerName: 'OK' },
    { field: 'koRecordCount', headerName: 'KO' },
    { field: 'status', headerName: 'Statut' },
];

const RECORD_EXPORT_COLUMNS: ExportColumn[] = [
    { field: 'id', headerName: 'ID' },
    { field: 'field', headerName: 'Champ' },
    { field: 'originalValue', headerName: 'Valeur originale' },
    { field: 'correctedValue', headerName: 'Valeur corrigée' },
    { field: 'validationStatus', headerName: 'Statut' },
    { field: 'rule', headerName: 'Règle' },
    { field: 'flagReason', headerName: 'Raison' },
];

// ─── Query keys ─────────────────────────────────────────────

const BATCHES_KEY = ['validation-batches'] as const;
const SUMMARY_KEY = ['validation-summary'] as const;
const batchRecordsKey = (id: string) => ['validation-records', id] as const;

// ─── Statut filter options ─────────────────────────────────────

const STATUS_OPTIONS = [
    { value: 'all', label: 'Tous les statuts' },
    { value: ValidationStatus.PENDING, label: 'En attente' },
    { value: ValidationStatus.IN_REVIEW, label: 'En revue' },
    { value: ValidationStatus.APPROVED, label: 'Approuvés' },
    { value: ValidationStatus.REJECTED, label: 'Rejetés' },
    { value: ValidationStatus.CORRECTED, label: 'Corrigés' },
];

// ─── Inline edit state for a single record ──────────────────

interface EditingCell {
    recordId: string;
    value: string;
}

// ─── Page ───────────────────────────────────────────────────

export default function ValidationPage() {
    const queryClient = useQueryClient();
    const { notify } = useNotificationStore();

    // Master list state
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedBatch, setSelectedBatch] = useState<ValidationBatch | null>(null);

    // Batch action dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogAction, setDialogAction] = useState<'approve' | 'reject'>('approve');
    const [comment, setComment] = useState('');

    // Inline edit state
    const [editingCell, setEditingCell] = useState<EditingCell | null>(null);

    // ── Fetch batches & summary ──
    const { data: batches, isLoading: batchesLoading, isError: batchesError } = useQuery({
        queryKey: BATCHES_KEY,
        queryFn: fetchValidationBatches,
        refetchInterval: 20_000,
    });

    const { data: summary } = useQuery({
        queryKey: SUMMARY_KEY,
        queryFn: fetchValidationSummary,
        refetchInterval: 20_000,
    });

    // ── Fetch records when a batch is selected ──
    const { data: records, isLoading: recordsLoading } = useQuery({
        queryKey: batchRecordsKey(selectedBatch?.id ?? ''),
        queryFn: () => fetchBatchRecords(selectedBatch!.id),
        enabled: !!selectedBatch,
    });

    // ── Filtered batches ──
    const filteredBatches = useMemo(() => {
        if (!batches) return [];
        return statusFilter === 'all' ? batches : batches.filter((b) => b.status === statusFilter);
    }, [batches, statusFilter]);

    // ── Record stats for detail panel ──
    const recordStats = useMemo(() => {
        if (!records) return { flagged: 0, corrected: 0, dismissed: 0, total: 0 };
        return {
            flagged: records.filter((r) => r.validationStatus === 'flagged').length,
            corrected: records.filter((r) => r.validationStatus === 'corrected').length,
            dismissed: records.filter((r) => r.validationStatus === 'dismissed').length,
            total: records.length,
        };
    }, [records]);

    // ── Mutations ──
    const approveMutation = useMutation({
        mutationFn: ({ id, comment }: { id: string; comment: string }) => approveBatch(id, comment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: BATCHES_KEY });
            queryClient.invalidateQueries({ queryKey: SUMMARY_KEY });
            notify('Batch approuvé — insertion ok.csv en base lancée', 'success');
            setDialogOpen(false);
            setSelectedBatch(null);
        },
        onError: () => notify("Erreur lors de l'approbation", 'error'),
    });

    const rejectMutation = useMutation({
        mutationFn: ({ id, comment }: { id: string; comment: string }) => rejectBatch(id, comment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: BATCHES_KEY });
            queryClient.invalidateQueries({ queryKey: SUMMARY_KEY });
            notify('Batch rejeté — re-soumission ETL requise', 'warning');
            setDialogOpen(false);
            setSelectedBatch(null);
        },
        onError: () => notify('Erreur lors du rejet', 'error'),
    });

    const correctMutation = useMutation({
        mutationFn: ({ recordId, correctedValue }: { recordId: string; correctedValue: string }) =>
            updateRecord(recordId, correctedValue),
        onSuccess: (_, { recordId }) => {
            queryClient.invalidateQueries({ queryKey: batchRecordsKey(selectedBatch!.id) });
            notify(`Record ${recordId} corrigé`, 'success');
            setEditingCell(null);
        },
        onError: () => notify('Erreur lors de la correction', 'error'),
    });

    const dismissMutation = useMutation({
        mutationFn: (recordId: string) => dismissRecord(recordId),
        onSuccess: (_, recordId) => {
            queryClient.invalidateQueries({ queryKey: batchRecordsKey(selectedBatch!.id) });
            notify(`Record ${recordId} ignoré`, 'info');
        },
        onError: () => notify('Erreur lors du dismiss', 'error'),
    });

    // ── Handlers ──
    const handleSelectBatch = useCallback((batch: ValidationBatch) => {
        setSelectedBatch(batch);
        setEditingCell(null);
    }, []);

    const handleBackToList = useCallback(() => {
        setSelectedBatch(null);
        setEditingCell(null);
    }, []);

    const handleOpenDialog = useCallback((action: 'approve' | 'reject') => {
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

    const handleStartEdit = useCallback((record: ValidationRecord) => {
        setEditingCell({ recordId: record.id, value: record.correctedValue || record.originalValue });
    }, []);

    const handleSaveEdit = useCallback(() => {
        if (!editingCell) return;
        correctMutation.mutate({ recordId: editingCell.recordId, correctedValue: editingCell.value });
    }, [editingCell, correctMutation]);

    const isPending = approveMutation.isPending || rejectMutation.isPending;
    const batchEditable = selectedBatch?.status === ValidationStatus.PENDING || selectedBatch?.status === ValidationStatus.IN_REVIEW;

    // ── Batch columns ──
    const batchColumns: GridColDef<ValidationBatch>[] = useMemo(() => [
        { field: 'id', headerName: 'Batch', width: 110 },
        {
            field: 'source',
            headerName: 'Source',
            width: 140,
            valueFormatter: (v: DataSource) => SOURCE_LABELS[v] || v,
        },
        {
            field: 'receivedAt',
            headerName: 'Réception',
            width: 150,
            valueFormatter: (v: string) => formatDateTime(v),
        },
        { field: 'okRecordCount', headerName: 'Records OK', width: 110, type: 'number' },
        {
            field: 'koRecordCount',
            headerName: 'Records KO',
            width: 110,
            type: 'number',
            renderCell: ({ value }) => (
                <Typography variant="body2" color="error" fontWeight={600}>
                    {formatNumber(value as number)}
                </Typography>
            ),
        },
        {
            field: 'status',
            headerName: 'Statut',
            width: 130,
            renderCell: ({ value }) => {
                const cfg = STATUS_CONFIG[value as ValidationStatus];
                return <Chip icon={cfg.icon} label={cfg.label} color={cfg.color} size="small" sx={{ fontWeight: 600 }} />;
            },
        },
        {
            field: 'actions',
            headerName: 'Détail',
            width: 130,
            sortable: false,
            filterable: false,
            renderCell: ({ row }) => (
                <Button
                    size="small"
                    variant="text"
                    onClick={() => handleSelectBatch(row)}
                    aria-label={`Voir les records KO du batch ${row.id}`}
                >
                    Ouvrir ko.csv
                </Button>
            ),
        },
    ], [handleSelectBatch]);

    // ── Record columns (editable) ──
    const recordColumns: GridColDef<ValidationRecord>[] = useMemo(() => [
        { field: 'id', headerName: 'ID', width: 100 },
        {
            field: 'field',
            headerName: 'Champ',
            width: 140,
            renderCell: ({ value }) => (
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                    {value as string}
                </Typography>
            ),
        },
        {
            field: 'originalValue',
            headerName: 'Valeur originale',
            width: 160,
            renderCell: ({ value }) => (
                <Tooltip title="Valeur telle que figurant dans ko.csv">
                    <Typography variant="body2" color="error.main" sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                        {(value as string) || '(vide)'}
                    </Typography>
                </Tooltip>
            ),
        },
        {
            field: 'correctedValue',
            headerName: 'Valeur corrigée',
            width: 200,
            renderCell: ({ row }) => {
                // Inline editing
                if (editingCell?.recordId === row.id) {
                    return (
                        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ width: '100%' }}>
                            <TextField
                                size="small"
                                variant="outlined"
                                value={editingCell.value}
                                onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveEdit();
                                    if (e.key === 'Escape') setEditingCell(null);
                                }}
                                autoFocus
                                sx={{
                                    flex: 1,
                                    '& .MuiInputBase-input': { fontFamily: 'monospace', fontSize: 13, py: 0.5 },
                                }}
                            />
                            <IconButton
                                size="small"
                                color="success"
                                onClick={handleSaveEdit}
                                disabled={correctMutation.isPending}
                                aria-label="Sauvegarder la correction"
                            >
                                <SaveIcon fontSize="small" />
                            </IconButton>
                        </Stack>
                    );
                }

                // Display mode
                if (row.correctedValue) {
                    return (
                        <Stack direction="row" spacing={0.5} alignItems="center">
                            <Typography variant="body2" color="success.main" sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                                {row.correctedValue}
                            </Typography>
                            {batchEditable && (
                                <IconButton size="small" onClick={() => handleStartEdit(row)} aria-label="Ré-éditer">
                                    <EditIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                            )}
                        </Stack>
                    );
                }

                // No correction yet
                return batchEditable ? (
                    <Button
                        size="small"
                        variant="text"
                        startIcon={<EditIcon sx={{ fontSize: 14 }} />}
                        onClick={() => handleStartEdit(row)}
                        sx={{ fontFamily: 'monospace', fontSize: 12, textTransform: 'none' }}
                    >
                        Corriger
                    </Button>
                ) : (
                    <Typography variant="body2" color="text.disabled">—</Typography>
                );
            },
        },
        {
            field: 'flagReason',
            headerName: 'Raison du flag',
            width: 230,
        },
        {
            field: 'rule',
            headerName: 'Règle',
            width: 150,
            renderCell: ({ value }) => (
                <Chip label={value as string} size="small" variant="outlined" sx={{ fontFamily: 'monospace', fontSize: 11 }} />
            ),
        },
        {
            field: 'validationStatus',
            headerName: 'Statut',
            width: 120,
            renderCell: ({ value }) => {
                const cfg = RECORD_STATUS_MAP[value as ValidationRecord['validationStatus']];
                return <Chip label={cfg.label} color={cfg.color} size="small" />;
            },
        },
        {
            field: 'recordActions',
            headerName: 'Actions',
            width: 130,
            sortable: false,
            filterable: false,
            renderCell: ({ row }) => {
                if (!batchEditable || row.validationStatus !== 'flagged') return null;
                return (
                    <Stack direction="row" spacing={0.5}>
                        <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleStartEdit(row)}
                            aria-label={`Éditer le record ${row.id}`}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                            size="small"
                            color="default"
                            onClick={() => dismissMutation.mutate(row.id)}
                            disabled={dismissMutation.isPending}
                            aria-label={`Ignorer le record ${row.id}`}
                        >
                            <VisibilityOffIcon fontSize="small" />
                        </IconButton>
                    </Stack>
                );
            },
        },
    ], [editingCell, batchEditable, handleStartEdit, handleSaveEdit, correctMutation.isPending, dismissMutation]);

    // ── Loading / Error ──
    if (batchesLoading) return <LoadingState />;
    if (batchesError) return <ErrorState message="Erreur lors du chargement des batches de validation." />;

    // ────────────────────────────────────────────────────────
    // DETAIL VIEW — ko.csv record editing for selected batch
    // ────────────────────────────────────────────────────────
    if (selectedBatch) {
        const statusCfg = STATUS_CONFIG[selectedBatch.status];
        return (
            <Box>
                <PageHeader
                    title={`Correction — ${selectedBatch.id}`}
                    subtitle={`${SOURCE_LABELS[selectedBatch.source]} · ${selectedBatch.koFileName}`}
                    actions={
                        <Stack direction="row" spacing={1}>
                            <ExportButton
                                fileName={`records-${selectedBatch.id}`}
                                title={`Records KO — ${selectedBatch.id}`}
                                columns={RECORD_EXPORT_COLUMNS}
                                rows={(records ?? []) as unknown as Record<string, unknown>[]}
                            />
                            <Button
                                variant="outlined"
                                startIcon={<ArrowBackIcon />}
                                onClick={handleBackToList}
                            >
                                Retour
                            </Button>
                        </Stack>
                    }
                />

                {/* Batch context bar */}
                <Paper elevation={0} sx={{ p: 2, mb: 2 }}>
                    <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap" useFlexGap>
                        <Chip icon={statusCfg.icon} label={statusCfg.label} color={statusCfg.color} />
                        <Typography variant="body2">
                            <strong>{formatNumber(selectedBatch.okRecordCount)}</strong> records OK
                            {' · '}
                            <Typography component="span" color="error.main" fontWeight={600} variant="body2">
                                {formatNumber(selectedBatch.koRecordCount)}
                            </Typography> records KO
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                            {selectedBatch.okFileName} / {selectedBatch.koFileName}
                        </Typography>
                        {selectedBatch.reviewer && (
                            <Typography variant="body2" color="text.secondary">
                                Reviewer : {selectedBatch.reviewer}
                            </Typography>
                        )}
                    </Stack>
                </Paper>

                {/* Record stats */}
                <KPIGrid
                    items={[
                        { id: 'flagged', label: 'Flaggés', value: recordStats.flagged, status: recordStats.flagged > 0 ? 'error' : 'success' },
                        { id: 'corrected', label: 'Corrigés', value: recordStats.corrected, status: 'success' },
                        { id: 'dismissed', label: 'Ignorés', value: recordStats.dismissed, status: 'warning' },
                        { id: 'total', label: 'Total records', value: recordStats.total, status: 'success' },
                    ]}
                    columns={{ xs: 6, sm: 3 }}
                    mb={2}
                />

                {batchEditable && recordStats.flagged > 0 && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        <strong>{recordStats.flagged}</strong> enregistrement{recordStats.flagged > 1 ? 's' : ''} en anomalie
                        — cliquez sur <EditIcon sx={{ fontSize: 14, verticalAlign: 'middle' }} /> pour corriger
                        ou <VisibilityOffIcon sx={{ fontSize: 14, verticalAlign: 'middle' }} /> pour ignorer.
                        Approuvez ou rejetez le batch une fois les corrections terminées.
                    </Alert>
                )}

                {/* Records DataGrid */}
                {recordsLoading ? (
                    <LoadingState />
                ) : !records?.length ? (
                    <EmptyState message="Aucun enregistrement KO pour ce batch." />
                ) : (
                    <Box sx={{ mb: 3 }}>
                        <DataTable
                            rows={records}
                            columns={recordColumns}
                            ariaLabel={`Enregistrements KO du batch ${selectedBatch.id}`}
                            defaultSort={{ field: 'validationStatus', sort: 'asc' }}
                            height={420}
                        />
                    </Box>
                )}

                {/* Batch-level actions */}
                {batchEditable && (
                    <>
                        <Divider sx={{ my: 2 }} />
                        <Stack direction="row" spacing={2} justifyContent="flex-end">
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<CheckCircleOutlineIcon />}
                                onClick={() => handleOpenDialog('approve')}
                                aria-label="Approuver le batch"
                            >
                                Approuver le batch
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<CancelOutlinedIcon />}
                                onClick={() => handleOpenDialog('reject')}
                                aria-label="Rejeter le batch"
                            >
                                Rejeter le batch
                            </Button>
                        </Stack>
                    </>
                )}

                {/* Approve / Reject Dialog */}
                <Dialog
                    open={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                    maxWidth="sm"
                    fullWidth
                    aria-labelledby="batch-action-dialog"
                >
                    <DialogTitle id="batch-action-dialog">
                        {dialogAction === 'approve' ? 'Approuver' : 'Rejeter'} le batch {selectedBatch.id}
                    </DialogTitle>
                    <DialogContent>
                        <Stack spacing={2} sx={{ pt: 1 }}>
                            <Stack direction="row" spacing={2}>
                                <Chip
                                    label={`${recordStats.corrected} corrigé${recordStats.corrected > 1 ? 's' : ''}`}
                                    color="success" size="small" variant="outlined"
                                />
                                <Chip
                                    label={`${recordStats.flagged} encore flaggé${recordStats.flagged > 1 ? 's' : ''}`}
                                    color={recordStats.flagged > 0 ? 'error' : 'success'} size="small" variant="outlined"
                                />
                                <Chip
                                    label={`${recordStats.dismissed} ignoré${recordStats.dismissed > 1 ? 's' : ''}`}
                                    size="small" variant="outlined"
                                />
                            </Stack>

                            {dialogAction === 'approve' ? (
                                <Typography variant="body2">
                                    En approuvant, les <strong>{formatNumber(selectedBatch.okRecordCount)}</strong> enregistrements
                                    valides seront insérés en base. Les <strong>{recordStats.corrected}</strong> corrections
                                    seront appliquées au fichier corrigé.
                                </Typography>
                            ) : (
                                <Typography variant="body2">
                                    En rejetant, le fichier <strong>{selectedBatch.koFileName}</strong> sera
                                    re-soumis au pipeline ETL pour re-traitement complet.
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
                                        ? 'Résumez les corrections apportées…'
                                        : 'Décrivez les anomalies justifiant le rejet…'
                                }
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                        </Stack>
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

    // ────────────────────────────────────────────────────────
    // MASTER VIEW — batch list with summary + tabs
    // ────────────────────────────────────────────────────────
    return (
        <Box>
            <PageHeader
                title="Validation des données"
                subtitle="Espace de correction admin — éditez les records KO issus de l'ETL, puis approuvez ou rejetez chaque batch"
                actions={
                    <ExportButton
                        fileName="validation-batches"
                        title="Validation — Batches ETL"
                        columns={BATCH_EXPORT_COLUMNS}
                        rows={filteredBatches as unknown as Record<string, unknown>[]}
                    />
                }
            />

            {/* KPI Summary */}
            {summary && (
                <KPIGrid
                    items={[
                        { id: 'pending', label: 'En attente', value: summary.pending, status: summary.pending > 0 ? 'warning' : 'success' },
                        { id: 'in-review', label: 'En revue', value: summary.inReview, status: 'warning' },
                        { id: 'approved', label: 'Approuvés', value: summary.approved, status: 'success' },
                        { id: 'rejected', label: 'Rejetés', value: summary.rejected, status: 'error' },
                        { id: 'corrected', label: 'Corrigés', value: summary.corrected, status: 'success' },
                        { id: 'total', label: 'Total', value: summary.total, status: 'success' },
                    ]}
                    columns={{ xs: 6, sm: 4, md: 2 }}
                />
            )}

            <FilterBar
                filters={[{
                    label: 'Statut',
                    value: statusFilter,
                    onChange: setStatusFilter,
                    options: STATUS_OPTIONS,
                }]}
                resultCount={filteredBatches.length}
                resultLabel="batch"
            />

            {/* Batch DataGrid */}
            <DataTable
                rows={filteredBatches}
                columns={batchColumns}
                ariaLabel="Batches de validation ETL"
                defaultSort={{ field: 'receivedAt', sort: 'desc' }}
                height={520}
            />
        </Box>
    );
}
