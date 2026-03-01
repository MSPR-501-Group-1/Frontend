import { useState, useMemo } from 'react';
import { Box, Chip } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import { fetchAuditLogs } from '@/services/audit.service';
import { LoadingState, ErrorState, PageHeader, ExportButton } from '@/components/feedback';
import { DataTable, FilterBar, StatsBar } from '@/components/shared';
import type { ExportColumn } from '@/lib/export.utils';
import { formatDateTime } from '@/lib/formatters';
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

/** Column descriptors for CSV/PDF export. */
const EXPORT_COLUMNS: ExportColumn[] = [
    { field: 'id', headerName: 'ID' },
    { field: 'timestamp', headerName: 'Date' },
    { field: 'user', headerName: 'Utilisateur' },
    { field: 'action', headerName: 'Action' },
    { field: 'detail', headerName: 'Détail' },
    { field: 'ip', headerName: 'Adresse IP' },
];

const ACTION_OPTIONS = [
    { value: 'all', label: 'Toutes les actions' },
    ...Object.entries(ACTION_CONFIG).map(([key, cfg]) => ({ value: key, label: cfg.label })),
];

// ─── Page ───────────────────────────────────────────────────

export default function AuditPage() {
    const [actionFilter, setActionFilter] = useState('all');
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
        { field: 'id', headerName: 'ID', width: 110 },
        {
            field: 'timestamp',
            headerName: 'Date',
            width: 160,
            valueFormatter: (value: string) => formatDateTime(value),
        },
        { field: 'user', headerName: 'Utilisateur', width: 180 },
        {
            field: 'action',
            headerName: 'Action',
            width: 170,
            renderCell: ({ value }) => {
                const cfg = ACTION_CONFIG[value as AuditAction];
                return <Chip label={cfg.label} color={cfg.color} size="small" sx={{ fontWeight: 600 }} />;
            },
        },
        { field: 'detail', headerName: 'Détail', flex: 1, minWidth: 250 },
        { field: 'ip', headerName: 'Adresse IP', width: 140 },
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

            <StatsBar items={[
                { label: `${logs?.length ?? 0} entrées totales` },
                { label: `${filteredRows.length} affichées`, color: 'primary' },
            ]} />

            <FilterBar
                filters={[{
                    label: "Type d'action",
                    value: actionFilter,
                    onChange: setActionFilter,
                    options: ACTION_OPTIONS,
                    minWidth: 200,
                }]}
                dateFilters={[
                    { label: 'Du', value: dateFrom, onChange: setDateFrom },
                    { label: 'Au', value: dateTo, onChange: setDateTo },
                ]}
                actions={
                    <ExportButton
                        fileName="audit-logs-export"
                        title="Audit Logs"
                        columns={EXPORT_COLUMNS}
                        rows={filteredRows as unknown as Record<string, unknown>[]}
                    />
                }
            />

            <DataTable
                rows={filteredRows}
                columns={columns}
                ariaLabel="Tableau des logs d'audit"
                defaultSort={{ field: 'timestamp', sort: 'desc' }}
            />
        </Box>
    );
}
