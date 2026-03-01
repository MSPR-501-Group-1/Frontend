import { useState, useMemo, useCallback } from 'react';
import { Box, Chip, Typography, Button } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAnomalies, correctAnomaly } from '@/services/anomalies.service';
import CorrectionDialog from '@/components/anomalies/CorrectionDialog';
import { LoadingState, ErrorState, PageHeader, ExportButton } from '@/components/feedback';
import { DataTable, FilterBar, StatsBar } from '@/components/shared';
import type { ExportColumn } from '@/lib/export.utils';
import { formatDate } from '@/lib/formatters';
import {
    SEVERITY_CONFIG, STATUS_CONFIG, TYPE_LABELS, SEVERITY_ORDER,
} from '@/lib/anomalies.constants';
import type { Anomaly, AnomalySeverity, AnomalyStatus, AnomalyType } from '@/types';
import { useNotificationStore } from '@/stores/notification.store';

// ─── Constants ──────────────────────────────────────────────

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

const SEVERITY_OPTIONS = [
    { value: 'all', label: 'Toutes' },
    { value: 'critical', label: 'Critique' },
    { value: 'high', label: 'Élevée' },
    { value: 'medium', label: 'Moyenne' },
    { value: 'low', label: 'Faible' },
];

// ─── Page ───────────────────────────────────────────────────

export default function AnomaliesPage() {
    const queryClient = useQueryClient();
    const { notify } = useNotificationStore();
    const [severityFilter, setSeverityFilter] = useState('all');
    const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    // ── Queries ──
    const { data: anomalies, isLoading, isError } = useQuery({
        queryKey: ['anomalies'],
        queryFn: fetchAnomalies,
    });

    const mutation = useMutation({
        mutationFn: ({ id, correctedValue, justification }: { id: string; correctedValue: string; justification: string }) =>
            correctAnomaly(id, correctedValue, justification),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['anomalies'] });
            setDialogOpen(false);
            setSelectedAnomaly(null);
            notify('Anomalie corrigée avec succès', 'success');
        },
        onError: () => {
            notify('Erreur lors de la correction', 'error');
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
        (id: string, correctedValue: string, justification: string) => {
            mutation.mutate({ id, correctedValue, justification });
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
                valueFormatter: (value: string) => formatDate(value),
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
            { field: 'description', headerName: 'Description', flex: 1, minWidth: 200 },
            {
                field: 'actions',
                headerName: 'Action',
                width: 120,
                sortable: false,
                filterable: false,
                renderCell: ({ row }) =>
                    row.status === 'open' || row.status === 'in_review' ? (
                        <Button size="small" variant="outlined" onClick={() => handleOpenCorrection(row)}>
                            Corriger
                        </Button>
                    ) : null,
            },
        ],
        [handleOpenCorrection],
    );

    // ── Loading / Error ──
    if (isLoading) return <LoadingState />;
    if (isError) return <ErrorState message="Erreur lors du chargement des anomalies." />;

    return (
        <Box>
            <PageHeader
                title="Anomalies"
                subtitle="Détection et correction des anomalies de données"
            />

            <StatsBar items={[
                { label: `${stats.total} total` },
                { label: `${stats.open} ouvertes`, color: 'error' },
                { label: `${stats.critical} critiques`, color: 'warning' },
            ]} />

            <FilterBar
                filters={[{
                    label: 'Sévérité',
                    value: severityFilter,
                    onChange: setSeverityFilter,
                    options: SEVERITY_OPTIONS,
                }]}
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
            />

            <DataTable
                rows={filteredRows}
                columns={columns}
                ariaLabel="Tableau des anomalies détectées"
                defaultSort={{ field: 'detectedAt', sort: 'desc' }}
            />

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
