import { useMemo, useState } from 'react';
import {
    Box,
    Chip,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import { fetchPartnerDashboard } from '@/services/partners.service';
import KPICard from '@/components/dashboard/KPICard';
import PartnerUsageChart from '@/components/partners/PartnerUsageChart';
import PartnerStatusPieChart from '@/components/partners/PartnerStatusPieChart';
import { LoadingState, ErrorState, PageHeader, ExportButton } from '@/components/feedback';
import { DataTable, FilterBar } from '@/components/shared';
import type { ExportColumn } from '@/lib/export.utils';
import type { Partner, PartnerStatus, BusinessKPI } from '@/types';
import { PARTNER_STATUS_LABELS } from '@/types';

const STATUS_COLOR: Record<PartnerStatus, 'success' | 'default'> = {
    active: 'success',
    inactive: 'default',
};

const EXPORT_COLUMNS: ExportColumn[] = [
    { field: 'name', headerName: 'Partenaire' },
    { field: 'status', headerName: 'Statut activite' },
    { field: 'usersCount', headerName: 'Utilisateurs lies' },
    { field: 'b2bUsersCount', headerName: 'Utilisateurs role B2B' },
    { field: 'activeUsers30d', headerName: 'Utilisateurs actifs (30j)' },
    { field: 'logins30d', headerName: 'Connexions (30j)' },
    { field: 'workoutSessions30d', headerName: 'Sessions workout (30j)' },
    { field: 'activityEvents30d', headerName: 'Evenements activite (30j)' },
    { field: 'lastActivity', headerName: 'Derniere activite' },
];

type StatusFilter = 'all' | PartnerStatus;

const formatNumber = (value: number): string => value.toLocaleString('fr-FR');

const formatNullableDate = (value: string | null): string => {
    if (!value) return 'Non disponible';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'Non disponible';
    return parsed.toLocaleDateString('fr-FR');
};

export default function PartnersPage() {
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const statusFilterLabelId = 'partners-status-filter-label';

    const { data, isLoading, isError } = useQuery({
        queryKey: ['partners-dashboard'],
        queryFn: fetchPartnerDashboard,
    });

    const statusOptions = useMemo<PartnerStatus[]>(() => {
        const unique = new Set<PartnerStatus>();
        data?.partners.forEach((partner) => unique.add(partner.status));
        return Array.from(unique);
    }, [data]);

    const filteredPartners = useMemo(() => {
        if (!data) return [];

        return data.partners.filter((partner) => {
            if (statusFilter !== 'all' && partner.status !== statusFilter) return false;
            return true;
        });
    }, [data, statusFilter]);

    const kpis = useMemo<BusinessKPI[]>(() => {
        if (!data) return [];

        const activePartners = data.partners.filter((partner) => partner.status === 'active').length;
        const totalUsers = data.partners.reduce((sum, partner) => sum + partner.usersCount, 0);
        const totalActiveUsers = data.partners.reduce((sum, partner) => sum + partner.activeUsers30d, 0);
        const totalActivityEvents = data.partners.reduce((sum, partner) => sum + partner.activityEvents30d, 0);

        return [
            { id: 'active-partners', label: 'Partenaires actifs (30j)', value: activePartners, status: 'success' },
            { id: 'total-users', label: 'Utilisateurs lies', value: totalUsers, status: 'success' },
            { id: 'active-users', label: 'Utilisateurs actifs (30j)', value: totalActiveUsers, status: 'success' },
            { id: 'activity-events', label: 'Evenements activite (30j)', value: totalActivityEvents, status: 'success' },
        ];
    }, [data]);

    const columns: GridColDef<Partner>[] = useMemo(() => [
        { field: 'name', headerName: 'Partenaire', width: 220 },
        {
            field: 'status',
            headerName: 'Statut activite',
            width: 160,
            renderCell: ({ value }) => {
                const status = value as PartnerStatus;
                return (
                    <Chip
                        label={PARTNER_STATUS_LABELS[status] ?? status}
                        color={STATUS_COLOR[status] ?? 'default'}
                        size="small"
                        sx={{ fontWeight: 600 }}
                    />
                );
            },
        },
        {
            field: 'usersCount',
            headerName: 'Utilisateurs lies',
            width: 160,
            valueFormatter: (value: number) => formatNumber(value),
        },
        {
            field: 'b2bUsersCount',
            headerName: 'Utilisateurs role B2B',
            width: 190,
            valueFormatter: (value: number) => formatNumber(value),
        },
        {
            field: 'activeUsers30d',
            headerName: 'Utilisateurs actifs (30j)',
            width: 190,
            valueFormatter: (value: number) => formatNumber(value),
        },
        {
            field: 'logins30d',
            headerName: 'Connexions (30j)',
            width: 150,
            valueFormatter: (value: number) => formatNumber(value),
        },
        {
            field: 'workoutSessions30d',
            headerName: 'Sessions workout (30j)',
            width: 180,
            valueFormatter: (value: number) => formatNumber(value),
        },
        {
            field: 'activityEvents30d',
            headerName: 'Evenements activite (30j)',
            width: 190,
            valueFormatter: (value: number) => formatNumber(value),
        },
        {
            field: 'lastActivity',
            headerName: 'Derniere activite',
            width: 150,
            valueFormatter: (value: string | null) => formatNullableDate(value),
        },
    ], []);

    if (isLoading) return <LoadingState />;
    if (isError) return <ErrorState message="Erreur lors du chargement des partenaires." />;
    if (!data) return null;

    return (
        <Box>
            <PageHeader
                title="Partenaires B2B"
                subtitle="Vue strictement alimentee par les donnees SQL organisation, login et workout"
                actions={
                    <ExportButton
                        fileName="partenaires-b2b"
                        title="Partenaires B2B - HealthAI"
                        columns={EXPORT_COLUMNS}
                        rows={filteredPartners as unknown as Record<string, unknown>[]}
                    />
                }
            />

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

            <FilterBar resultCount={filteredPartners.length} resultLabel="partenaire">
                <FormControl size="small" sx={{ minWidth: 220 }}>
                    <InputLabel id={statusFilterLabelId}>Statut activite</InputLabel>
                    <Select
                        labelId={statusFilterLabelId}
                        value={statusFilter}
                        label="Statut activite"
                        onChange={(event: SelectChangeEvent) => setStatusFilter(event.target.value as StatusFilter)}
                    >
                        <MenuItem value="all">Tous les statuts</MenuItem>
                        {statusOptions.map((status) => (
                            <MenuItem key={status} value={status}>{PARTNER_STATUS_LABELS[status] ?? status}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </FilterBar>

            <DataTable
                rows={filteredPartners}
                columns={columns}
                ariaLabel="Tableau des partenaires B2B"
                defaultSort={{ field: 'activityEvents30d', sort: 'desc' }}
            />

            <Typography variant="h5" sx={{ mb: 2 }}>
                Analyse d'activite
            </Typography>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 7 }}>
                    <PartnerUsageChart
                        data={data.usageByPartner}
                        title="Evenements d'activite par partenaire"
                        subtitle="Connexions + sessions workout sur 30 jours"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 5 }}>
                    <PartnerStatusPieChart
                        data={data.partnerStatusBreakdown}
                        title="Repartition par statut d'activite"
                        subtitle="Partenaires actifs vs inactifs sur 30 jours"
                    />
                </Grid>
            </Grid>
        </Box>
    );
}
