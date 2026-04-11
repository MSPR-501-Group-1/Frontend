import { useState, useMemo, useCallback } from 'react';
import {
    Box,
    Typography,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAnomalies, correctAnomaly } from '@/services/anomalies.service';
import CorrectionDialog from '@/components/anomalies/CorrectionDialog';
import { LoadingState, ErrorState, PageHeader, ExportButton } from '@/components/feedback';
import { DataTable, FilterBar, StatsBar } from '@/components/shared';
import type { ExportColumn } from '@/lib/export.utils';
import { getErrorMessage } from '@/lib/error.utils';
import {
    SEVERITY_CONFIG, STATUS_CONFIG, TYPE_LABELS, SEVERITY_ORDER,
} from '@/lib/anomalies.constants';
import type { Anomaly, AnomalySeverity, AnomalyStatus, AnomalyType } from '@/types';
import { useNotificationStore } from '@/stores/notification.store';
import { useAuthStore } from '@/stores/auth.store';

// ─── Page ───────────────────────────────────────────────────

type SeverityFilter = 'all' | AnomalySeverity;
type StatusFilter = 'all' | 'open' | 'resolved';

/** Column descriptors for CSV/PDF export (decoupled from DataGrid columns). */
const EXPORT_COLUMNS: ExportColumn[] = [
    { field: 'id', headerName: 'ID' },
    { field: 'detectedAt', headerName: 'Détection' },
    { field: 'source', headerName: 'Source' },
    { field: 'field', headerName: 'Champ' },
    { field: 'type', headerName: 'Type' },
    { field: 'severity', headerName: 'Sévérité' },
    { field: 'status', headerName: 'Statut' },
    { field: 'description', headerName: 'Description' },
];

export default function AnomaliesPage() {
    const queryClient = useQueryClient();
    const currentUserId = useAuthStore((state) => state.user?.user_id);
    const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
    const severityFilterLabelId = 'anomalies-severity-filter-label';
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const statusFilterLabelId = 'anomalies-status-filter-label';
    const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    // ── Queries ──
    const { data: anomalies, isLoading, isError, error } = useQuery({
        queryKey: ['anomalies', statusFilter],
        queryFn: () => fetchAnomalies({ range: 'all', status: statusFilter, page: 1, perPage: 200 }),
    });

    const mutation = useMutation({
        mutationFn: ({ id, resolutionAction }: { id: string; resolutionAction: string }) => {
            if (!currentUserId) {
                throw new Error('Utilisateur non authentifie.');
            }

            return correctAnomaly(id, resolutionAction, currentUserId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['anomalies'] });
            setDialogOpen(false);
            setSelectedAnomaly(null);
            useNotificationStore.getState().notify('Anomalie corrigée avec succès', 'success');
        },
        onError: (mutationError) => {
            useNotificationStore.getState().notify(getErrorMessage(mutationError, 'Erreur lors de la correction'), 'error');
        },
    });

    // ── Filtered data ──
    const filteredRows = useMemo(() => {
        if (!anomalies) return [];
        if (severityFilter === 'all') return anomalies;
        return anomalies.filter((a) => a.severity === severityFilter);
    }, [anomalies, severityFilter]);

    // ── Stats ──
    const stats = useMemo(() => {
        if (!anomalies) return { total: 0, open: 0, critical: 0 };
        return {
            total: anomalies.length,
            open: anomalies.filter((a) => a.status === 'open').length,
            critical: anomalies.filter((a) => a.severity === 'critical').length,
        };
    }, [anomalies]);

    // ── Handlers ──
    const handleOpenCorrection = useCallback((anomaly: Anomaly) => {
        setSelectedAnomaly(anomaly);
        setDialogOpen(true);
    }, []);

    const handleCorrection = useCallback(
        (id: string, resolutionAction: string) => {
            mutation.mutate({ id, resolutionAction });
        },
        [mutation],
    );

    // ── Columns ──
    const columns: GridColDef<Anomaly>[] = useMemo(
        () => [
            {
                field: 'id',
                headerName: 'ID',
                width: 120,
                renderCell: ({ value }) => (
                    <Typography variant="body2" fontWeight={600} fontFamily="monospace">
                        {value}
                    </Typography>
                ),
            },
            {
                field: 'detectedAt',
                headerName: 'Détection',
                width: 150,
                valueFormatter: (value: string) => {
                    const d = new Date(value);
                    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                },
            },
            { field: 'source', headerName: 'Source', width: 150 },
            { field: 'field', headerName: 'Champ', width: 120 },
            {
                field: 'type',
                headerName: 'Type',
                width: 130,
                valueFormatter: (value: AnomalyType) => TYPE_LABELS[value] || value,
            },
            {
                field: 'severity',
                headerName: 'Sévérité',
                width: 120,
                renderCell: ({ value }) => {
                    const cfg = SEVERITY_CONFIG[value as AnomalySeverity];
                    return <Chip label={cfg.label} color={cfg.color} size="small" sx={{ fontWeight: 600 }} />;
                },
                sortComparator: (a: AnomalySeverity, b: AnomalySeverity) =>
                    SEVERITY_ORDER.indexOf(a) - SEVERITY_ORDER.indexOf(b),
            },
            {
                field: 'status',
                headerName: 'Statut',
                width: 120,
                renderCell: ({ value }) => {
                    const cfg = STATUS_CONFIG[value as AnomalyStatus];
                    return <Chip label={cfg.label} color={cfg.color} size="small" variant="outlined" />;
                },
            },
            {
                field: 'description',
                headerName: 'Description',
                flex: 1,
                minWidth: 200,
            },
            {
                field: 'actions',
                headerName: 'Action',
                width: 120,
                sortable: false,
                filterable: false,
                renderCell: ({ row }) =>
                    row.status === 'open' ? (
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleOpenCorrection(row)}
                        >
                            Corriger
                        </Button>
                    ) : null,
            },
        ],
        [handleOpenCorrection],
    );

    // ── Loading / Error ──
    if (isLoading) return <LoadingState />;
    if (isError) return <ErrorState message={getErrorMessage(error, 'Erreur lors du chargement des anomalies.')} />;

    return (
        <Box>
            {/* Header — uses shared PageHeader instead of raw Typography */}
            <PageHeader
                title="Anomalies"
                subtitle="Détection et correction des anomalies de données"
            />

            {/* Stats chips */}
            <StatsBar stats={[
                { label: `${stats.total} total` },
                { label: `${stats.open} ouvertes`, color: 'error' },
                { label: `${stats.critical} critiques`, color: 'warning' },
            ]} />

            {/* Severity filter */}
            <FilterBar
                resultCount={filteredRows.length}
                resultLabel="anomalie"
                actions={
                    <ExportButton
                        fileName="anomalies-export"
                        title="Anomalies"
                        columns={EXPORT_COLUMNS}
                        rows={filteredRows as unknown as Record<string, unknown>[]}
                    />
                }
            >
                <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel id={statusFilterLabelId}>Statut</InputLabel>
                    <Select
                        labelId={statusFilterLabelId}
                        value={statusFilter}
                        label="Statut"
                        onChange={(e: SelectChangeEvent) => setStatusFilter(e.target.value as StatusFilter)}
                    >
                        <MenuItem value="all">Tous</MenuItem>
                        <MenuItem value="open">Ouvertes</MenuItem>
                        <MenuItem value="resolved">Resolues</MenuItem>
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel id={severityFilterLabelId}>Sévérité</InputLabel>
                    <Select
                        labelId={severityFilterLabelId}
                        value={severityFilter}
                        label="Sévérité"
                        onChange={(e: SelectChangeEvent) => setSeverityFilter(e.target.value as SeverityFilter)}
                    >
                        <MenuItem value="all">Toutes</MenuItem>
                        <MenuItem value="critical">Critique</MenuItem>
                        <MenuItem value="high">Élevée</MenuItem>
                        <MenuItem value="medium">Moyenne</MenuItem>
                        <MenuItem value="low">Faible</MenuItem>
                    </Select>
                </FormControl>
            </FilterBar>

            {/* DataGrid */}
            <DataTable
                rows={filteredRows}
                columns={columns}
                ariaLabel="Tableau des anomalies détectées"
                defaultSort={{ field: 'detectedAt', sort: 'desc' }}
            />

            {/* Correction Dialog */}
            <CorrectionDialog
                anomaly={selectedAnomaly}
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onSubmit={handleCorrection}
                isSubmitting={mutation.isPending}
            />
        </Box>
    );
}
