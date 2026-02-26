import { useState, useMemo, useCallback } from 'react';
import {
    Box,
    Typography,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    Button,
    Stack,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAnomalies, correctAnomaly } from '@/services/anomalies.service';
import CorrectionDialog from '@/components/anomalies/CorrectionDialog';
import { LoadingState, ErrorState, ExportButton } from '@/components/feedback';
import type { ExportColumn } from '@/lib/export.utils';
import {
    SEVERITY_CONFIG, STATUS_CONFIG, TYPE_LABELS, SEVERITY_ORDER,
} from '@/lib/anomalies.constants';
import type { Anomaly, AnomalySeverity, AnomalyStatus, AnomalyType } from '@/types';

// ─── Page ───────────────────────────────────────────────────

type SeverityFilter = 'all' | AnomalySeverity;

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
    const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
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
                    row.status === 'open' || row.status === 'in_review' ? (
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
    if (isError) return <ErrorState message="Erreur lors du chargement des anomalies." />;

    return (
        <Box>
            {/* Header */}
            <Typography variant="h4" gutterBottom>
                Anomalies
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
                Détection et correction des anomalies de données
            </Typography>

            {/* Stats chips */}
            <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
                <Chip label={`${stats.total} total`} variant="outlined" />
                <Chip label={`${stats.open} ouvertes`} color="error" variant="outlined" />
                <Chip label={`${stats.critical} critiques`} color="warning" variant="outlined" />
            </Stack>

            {/* Severity filter */}
            <Paper elevation={0} sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel>Sévérité</InputLabel>
                    <Select
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
                <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                    {filteredRows.length} anomalie{filteredRows.length > 1 ? 's' : ''} affichée{filteredRows.length > 1 ? 's' : ''}
                </Typography>
                <ExportButton
                    fileName="anomalies-export"
                    title="Anomalies"
                    columns={EXPORT_COLUMNS}
                    rows={filteredRows as unknown as Record<string, unknown>[]}
                />
            </Paper>

            {/* DataGrid */}
            <Paper elevation={0} sx={{ height: 560 }}>
                <DataGrid
                    rows={filteredRows}
                    columns={columns}
                    initialState={{
                        sorting: { sortModel: [{ field: 'detectedAt', sort: 'desc' }] },
                        pagination: { paginationModel: { pageSize: 10 } },
                    }}
                    pageSizeOptions={[10, 25, 50]}
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
