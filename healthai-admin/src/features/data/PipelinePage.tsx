import { useState, useMemo } from 'react';
import {
    Box,
    Chip,
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
import type { GridColDef } from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import { fetchPipelineRuns } from '@/services/pipeline.service';
import { LoadingState, ErrorState, PageHeader } from '@/components/feedback';
import { DataTable, FilterBar, StatsBar } from '@/components/shared';
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
    [DataSource.OPEN_FOOD_FACTS]: 'OpenFoodFacts',
    [DataSource.WHO_NUTRITION_DB]: 'WHO Nutrition DB',
    [DataSource.EXERCISE_DB]: 'ExerciseDB',
    [DataSource.USER_WEARABLES]: 'User Wearables',
    [DataSource.ANSES_CIQUAL]: 'ANSES CIQUAL',
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
    const statusFilterLabelId = 'pipeline-status-filter-label';

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

            {/* Stats */}
            <StatsBar stats={[
                { label: `${stats.total} exécutions` },
                { label: `${stats.success} succès`, color: 'success' },
                { label: `${stats.failed} échoués`, color: 'error' },
                { label: `${stats.running} en cours`, color: 'info' },
            ]} />

            {/* Filter */}
            <FilterBar resultCount={filteredRows.length} resultLabel="exécution">
                <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel id={statusFilterLabelId}>Statut</InputLabel>
                    <Select
                        labelId={statusFilterLabelId}
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
            </FilterBar>

            {/* DataGrid */}
            <DataTable
                rows={filteredRows}
                columns={columns}
                ariaLabel="Tableau des exécutions du pipeline ETL"
                defaultSort={{ field: 'startedAt', sort: 'desc' }}
            />

        </Box>
    );
}
