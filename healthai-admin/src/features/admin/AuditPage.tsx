import { useState, useMemo } from 'react';
import {
    Box,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    Stack,
    TextField,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import { fetchAuditLogs } from '@/services/audit.service';
import { LoadingState, ErrorState, PageHeader, ExportButton } from '@/components/feedback';
import type { ExportColumn } from '@/lib/export.utils';
import type { AuditLog, AuditAction } from '@/types';

// ─── Action display config ──────────────────────────────────

const ACTION_CONFIG: Record<AuditAction, { label: string; color: 'success' | 'error' | 'warning' | 'info' | 'default' }> = {
    login: { label: 'Connexion', color: 'success' },
    logout: { label: 'Déconnexion', color: 'default' },
    create_user: { label: 'Création compte', color: 'info' },
    update_role: { label: 'Modification rôle', color: 'warning' },
    correct_anomaly: { label: 'Correction anomalie', color: 'info' },
    approve_batch: { label: 'Approbation batch', color: 'success' },
    reject_batch: { label: 'Rejet batch', color: 'error' },
    export_data: { label: 'Export données', color: 'default' },
    update_config: { label: 'Modification config', color: 'warning' },
    delete_record: { label: 'Suppression', color: 'error' },
};

// ─── Page ───────────────────────────────────────────────────

type ActionFilter = 'all' | AuditAction;

/** Column descriptors for CSV/PDF export. */
const EXPORT_COLUMNS: ExportColumn[] = [
    { field: 'id', headerName: 'ID' },
    { field: 'timestamp', headerName: 'Date' },
    { field: 'user', headerName: 'Utilisateur' },
    { field: 'action', headerName: 'Action' },
    { field: 'detail', headerName: 'Détail' },
    { field: 'ip', headerName: 'Adresse IP' },
];

export default function AuditPage() {
    const [actionFilter, setActionFilter] = useState<ActionFilter>('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const { data: logs, isLoading, isError } = useQuery({
        queryKey: ['audit-logs'],
        queryFn: fetchAuditLogs,
    });

    // ── Filtered data ──
    const filteredRows = useMemo(() => {
        if (!logs) return [];
        let filtered = logs;
        if (actionFilter !== 'all') {
            filtered = filtered.filter((l) => l.action === actionFilter);
        }
        if (dateFrom) {
            filtered = filtered.filter((l) => l.timestamp >= dateFrom);
        }
        if (dateTo) {
            filtered = filtered.filter((l) => l.timestamp <= `${dateTo}T23:59:59`);
        }
        return filtered;
    }, [logs, actionFilter, dateFrom, dateTo]);

    // ── Columns ──
    const columns: GridColDef<AuditLog>[] = useMemo(() => [
        {
            field: 'id',
            headerName: 'ID',
            width: 110,
        },
        {
            field: 'timestamp',
            headerName: 'Date',
            width: 160,
            valueFormatter: (value: string) =>
                new Date(value).toLocaleString('fr-FR', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                }),
        },
        {
            field: 'user',
            headerName: 'Utilisateur',
            width: 180,
        },
        {
            field: 'action',
            headerName: 'Action',
            width: 170,
            renderCell: ({ value }) => {
                const cfg = ACTION_CONFIG[value as AuditAction];
                return <Chip label={cfg.label} color={cfg.color} size="small" sx={{ fontWeight: 600 }} />;
            },
        },
        {
            field: 'detail',
            headerName: 'Détail',
            flex: 1,
            minWidth: 250,
        },
        {
            field: 'ip',
            headerName: 'Adresse IP',
            width: 140,
        },
    ], []);

    // ── Loading / Error ──
    if (isLoading) return <LoadingState />;
    if (isError) return <ErrorState message="Erreur lors du chargement des logs d'audit." />;

    return (
        <Box>
            <PageHeader
                title="Audit Logs"
                subtitle="Journal de traçabilité des actions utilisateurs"
            />

            {/* Stats */}
            <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
                <Chip label={`${logs?.length ?? 0} entrées totales`} variant="outlined" />
                <Chip label={`${filteredRows.length} affichées`} color="primary" variant="outlined" />
            </Stack>

            {/* Filters */}
            <Paper elevation={0} sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Type d'action</InputLabel>
                    <Select
                        value={actionFilter}
                        label="Type d'action"
                        onChange={(e: SelectChangeEvent) => setActionFilter(e.target.value as ActionFilter)}
                    >
                        <MenuItem value="all">Toutes les actions</MenuItem>
                        {Object.entries(ACTION_CONFIG).map(([key, cfg]) => (
                            <MenuItem key={key} value={key}>{cfg.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField
                    size="small"
                    type="date"
                    label="Du"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                    size="small"
                    type="date"
                    label="Au"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                />
                <Box sx={{ flexGrow: 1 }} />
                <ExportButton
                    fileName="audit-logs-export"
                    title="Audit Logs"
                    columns={EXPORT_COLUMNS}
                    rows={filteredRows as unknown as Record<string, unknown>[]}
                />
            </Paper>

            {/* DataGrid */}
            <Paper elevation={0} sx={{ height: 560 }}>
                <DataGrid
                    rows={filteredRows}
                    columns={columns}
                    aria-label="Tableau des logs d'audit"
                    initialState={{
                        sorting: { sortModel: [{ field: 'timestamp', sort: 'desc' }] },
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
        </Box>
    );
}
