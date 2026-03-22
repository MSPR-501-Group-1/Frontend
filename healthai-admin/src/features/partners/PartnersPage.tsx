/**
 * PartnersPage — full B2B partner management page.
 *
 * Architecture layers consumed:
 *   types/ → mocks/ → services/ → [useQuery] → components/ → this page
 *
 * Patterns:
 *   - React Query for data fetching + polling
 *   - DataGrid MUI for tabular data with filters & pagination
 *   - Reusable components: KPICard, ExportButton, PageHeader (DRY)
 *   - Charts: PartnerUsageChart, PartnerTypePieChart (SRP per chart)
 */

import { useState, useMemo } from 'react';
import {
    Box, Grid, Chip, FormControl, InputLabel,
    Select, MenuItem, Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import { fetchPartnerDashboard } from '@/services/partners.service';
import KPICard from '@/components/dashboard/KPICard';
import PartnerUsageChart from '@/components/partners/PartnerUsageChart';
import PartnerTypePieChart from '@/components/partners/PartnerTypePieChart';
import { LoadingState, ErrorState, PageHeader, ExportButton } from '@/components/feedback';
import { DataTable, FilterBar } from '@/components/shared';
import type { ExportColumn } from '@/lib/export.utils';
import type { Partner, PartnerType, PartnerStatus, BusinessKPI } from '@/types';
import { PARTNER_TYPE_LABELS, PARTNER_STATUS_LABELS } from '@/types';

// ─── Display config (SRP: visual mapping isolated from logic) ──

const STATUS_COLOR: Record<PartnerStatus, 'success' | 'warning' | 'error' | 'default'> = {
    active: 'success',
    trial: 'warning',
    suspended: 'error',
    churned: 'default',
};

// ─── Export columns (DRY: declared once, used for CSV & PDF) ──

const EXPORT_COLUMNS: ExportColumn[] = [
    { field: 'name', headerName: 'Partenaire' },
    { field: 'type', headerName: 'Type' },
    { field: 'status', headerName: 'Statut' },
    { field: 'usersCount', headerName: 'Utilisateurs' },
    { field: 'apiCallsMonth', headerName: 'API Calls / mois' },
    { field: 'contractStart', headerName: 'Début contrat' },
    { field: 'contractEnd', headerName: 'Fin contrat' },
];

// ─── Filters ────────────────────────────────────────────────

type TypeFilter = 'all' | PartnerType;
type StatusFilter = 'all' | PartnerStatus;

// ─── Page ───────────────────────────────────────────────────

export default function PartnersPage() {
    const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const typeFilterLabelId = 'partners-type-filter-label';
    const statusFilterLabelId = 'partners-status-filter-label';

    const { data, isLoading, isError } = useQuery({
        queryKey: ['partners-dashboard'],
        queryFn: fetchPartnerDashboard,
    });

    // ── Filtered rows ──
    const filteredPartners = useMemo(() => {
        if (!data) return [];
        return data.partners.filter((p) => {
            if (typeFilter !== 'all' && p.type !== typeFilter) return false;
            if (statusFilter !== 'all' && p.status !== statusFilter) return false;
            return true;
        });
    }, [data, typeFilter, statusFilter]);

    // ── KPIs (computed from data — SRP: derived state) ──
    const kpis = useMemo<BusinessKPI[]>(() => {
        if (!data) return [];
        const { partners } = data;
        const active = partners.filter((p) => p.status === 'active').length;
        const totalUsers = partners.reduce((s, p) => s + p.usersCount, 0);
        const totalCalls = partners.reduce((s, p) => s + p.apiCallsMonth, 0);
        const avgSatisfaction = partners.length > 0
            ? Math.round(partners.reduce((s, p) => s + p.satisfactionScore, 0) / partners.length)
            : 0;

        return [
            { id: 'active-partners', label: 'Partenaires actifs', value: active, status: 'success' },
            { id: 'total-users', label: 'Utilisateurs total', value: totalUsers, status: 'success' },
            { id: 'api-calls', label: 'API Calls / mois', value: `${(totalCalls / 1_000_000).toFixed(1)}M`, status: 'success' },
            { id: 'satisfaction', label: 'Satisfaction moyenne', value: avgSatisfaction, unit: '%', status: avgSatisfaction >= 80 ? 'success' : 'warning' },
        ];
    }, [data]);

    // ── DataGrid columns ──
    const columns: GridColDef<Partner>[] = useMemo(() => [
        { field: 'name', headerName: 'Partenaire', width: 180 },
        {
            field: 'type',
            headerName: 'Type',
            width: 160,
            renderCell: ({ value }) => (
                <Chip
                    label={PARTNER_TYPE_LABELS[value as PartnerType]}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                />
            ),
        },
        {
            field: 'status',
            headerName: 'Statut',
            width: 120,
            renderCell: ({ value }) => (
                <Chip
                    label={PARTNER_STATUS_LABELS[value as PartnerStatus]}
                    color={STATUS_COLOR[value as PartnerStatus]}
                    size="small"
                    sx={{ fontWeight: 600 }}
                />
            ),
        },
        {
            field: 'usersCount',
            headerName: 'Utilisateurs',
            width: 130,
            valueFormatter: (v: number) => v.toLocaleString('fr-FR'),
        },
        {
            field: 'apiCallsMonth',
            headerName: 'API Calls / mois',
            width: 150,
            valueFormatter: (v: number) => v.toLocaleString('fr-FR'),
        },
        {
            field: 'contractStart',
            headerName: 'Début contrat',
            width: 130,
            valueFormatter: (v: string) =>
                new Date(v).toLocaleDateString('fr-FR'),
        },
        {
            field: 'contractEnd',
            headerName: 'Fin contrat',
            width: 130,
            valueFormatter: (v: string) =>
                new Date(v).toLocaleDateString('fr-FR'),
        },
        {
            field: 'satisfactionScore',
            headerName: 'Satisfaction',
            width: 120,
            renderCell: ({ value }) => (
                <Chip
                    label={`${value}%`}
                    color={Number(value) >= 80 ? 'success' : Number(value) >= 60 ? 'warning' : 'error'}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                />
            ),
        },
    ], []);

    // ── Loading / Error states ──
    if (isLoading) return <LoadingState />;
    if (isError) return <ErrorState message="Erreur lors du chargement des partenaires." />;
    if (!data) return null;

    return (
        <Box>
            <PageHeader
                title="Partenaires B2B"
                subtitle="Suivi et pilotage des accès et indicateurs partenaires"
                actions={
                    <ExportButton
                        fileName="partenaires-b2b"
                        title="Partenaires B2B — HealthAI"
                        columns={EXPORT_COLUMNS}
                        rows={filteredPartners as unknown as Record<string, unknown>[]}
                    />
                }
            />

            {/* KPI Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {kpis.map((kpi) => (
                    <Grid key={kpi.id} size={{ xs: 12, sm: 6, md: 3 }}>
                        <KPICard
                            label={kpi.label}
                            value={kpi.value}
                            unit={kpi.unit}
                            status={kpi.status}
                        />
                    </Grid>
                ))}
            </Grid>

            {/* Filters */}
            <FilterBar resultCount={filteredPartners.length} resultLabel="partenaire">
                <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel id={typeFilterLabelId}>Type</InputLabel>
                    <Select
                        labelId={typeFilterLabelId}
                        value={typeFilter}
                        label="Type"
                        onChange={(e: SelectChangeEvent) => setTypeFilter(e.target.value as TypeFilter)}
                    >
                        <MenuItem value="all">Tous les types</MenuItem>
                        {Object.entries(PARTNER_TYPE_LABELS).map(([key, label]) => (
                            <MenuItem key={key} value={key}>{label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel id={statusFilterLabelId}>Statut</InputLabel>
                    <Select
                        labelId={statusFilterLabelId}
                        value={statusFilter}
                        label="Statut"
                        onChange={(e: SelectChangeEvent) => setStatusFilter(e.target.value as StatusFilter)}
                    >
                        <MenuItem value="all">Tous les statuts</MenuItem>
                        {Object.entries(PARTNER_STATUS_LABELS).map(([key, label]) => (
                            <MenuItem key={key} value={key}>{label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </FilterBar>

            {/* DataGrid */}
            <DataTable
                rows={filteredPartners}
                columns={columns}
                ariaLabel="Tableau des partenaires B2B"
                defaultSort={{ field: 'apiCallsMonth', sort: 'desc' }}
            />

            {/* Charts */}
            <Typography variant="h5" sx={{ mb: 2 }}>
                Analyse d'usage
            </Typography>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 7 }}>
                    <PartnerUsageChart
                        data={data.usageByPartner}
                        title="Appels API par partenaire"
                        subtitle="Volume mensuel — top partenaires actifs"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 5 }}>
                    <PartnerTypePieChart
                        data={data.partnerTypesBreakdown}
                        title="Répartition par type"
                        subtitle="Distribution des partenaires par catégorie"
                    />
                </Grid>
            </Grid>
        </Box>
    );
}
