import { useState, useMemo } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import SyncIcon from '@mui/icons-material/Sync';
import type { GridColDef } from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import { fetchPipelineRuns } from '@/services/pipeline.service';
import { LoadingState, ErrorState, PageHeader } from '@/components/feedback';
import { DataTable, FilterBar, StatsBar } from '@/components/shared';
import { SOURCE_LABELS } from '@/lib/labels.constants';
import { formatDateTime, formatDuration, formatNumber } from '@/lib/formatters';
import type { PipelineRun, PipelineStatus } from '@/types';
import type { DataSource } from '@/types';

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

const STATUS_OPTIONS = [
    { value: 'all', label: 'Tous les statuts' },
    ...Object.entries(STATUS_CONFIG).map(([key, cfg]) => ({ value: key, label: cfg.label })),
];

// ─── Page ───────────────────────────────────────────────────

export default function PipelinePage() {
    const [statusFilter, setStatusFilter] = useState('all');

    const { data: runs, isLoading, isError } = useQuery({
        queryKey: ['pipeline-runs'],
        queryFn: fetchPipelineRuns,
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

    // ── Columns ──
    const columns: GridColDef<PipelineRun>[] = useMemo(() => [
        { field: 'id', headerName: 'ID', width: 110 },
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
            valueFormatter: (value: string) => formatDateTime(value),
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
                return <Chip icon={cfg.icon} label={cfg.label} color={cfg.color} size="small" sx={{ fontWeight: 600 }} />;
            },
        },
        {
            field: 'recordsProcessed',
            headerName: 'Traités',
            width: 100,
            valueFormatter: (value: number) => formatNumber(value),
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
                    {formatNumber(value as number)}
                </Typography>
            ),
        },
        { field: 'triggeredBy', headerName: 'Déclenché par', width: 160 },
    ], []);

    // ── Loading / Error ──
    if (isLoading) return <LoadingState />;
    if (isError) return <ErrorState message="Erreur lors du chargement du pipeline ETL." />;

    return (
        <Box>
            <PageHeader
                title="Pipeline ETL — Historique"
                subtitle="Journal en lecture seule des exécutions d'ingestion Spark (suivi de débit, statuts, durées)"
            />

            <StatsBar items={[
                { label: `${stats.total} exécutions` },
                { label: `${stats.success} succès`, color: 'success' },
                { label: `${stats.failed} échoués`, color: 'error' },
                { label: `${stats.running} en cours`, color: 'info' },
            ]} />

            <FilterBar
                filters={[{
                    label: 'Statut',
                    value: statusFilter,
                    onChange: setStatusFilter,
                    options: STATUS_OPTIONS,
                }]}
                resultCount={filteredRows.length}
                resultLabel="exécution"
            />

            <DataTable
                rows={filteredRows}
                columns={columns}
                ariaLabel="Tableau des exécutions du pipeline ETL"
                defaultSort={{ field: 'startedAt', sort: 'desc' }}
            />
        </Box>
    );
}
