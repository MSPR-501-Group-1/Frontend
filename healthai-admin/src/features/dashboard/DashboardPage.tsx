import { Typography, Box, Grid } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import KPICard from '@/components/dashboard/KPICard';
import ActivityLineChart from '@/components/dashboard/ActivityLineChart';
import SourcesPieChart from '@/components/dashboard/SourcesPieChart';
import AnomaliesBarChart from '@/components/dashboard/AnomaliesBarChart';
import DataIngestionAreaChart from '@/components/dashboard/DataIngestionAreaChart';
import AnomalyTrendChart from '@/components/dashboard/AnomalyTrendChart';
import DateRangeSelector from '@/components/analytics/DateRangeSelector';
import { LoadingState, ErrorState, PageHeader, ExportButton } from '@/components/feedback';
import type { ExportColumn } from '@/lib/export.utils';
import { getErrorMessage } from '@/lib/error.utils';
import type { DateRange } from '@/types';
import { fetchDashboardData } from '@/services/dashboard.service';

// ─── KPI → drill-down route mapping (SRP: config déclarative) ───
const KPI_DRILLDOWN_ROUTES: Record<string, string> = {
    'active-users': '/analytics/business',
    'data-quality': '/data/quality',
    'anomalies-open': '/data/anomalies',
    'records-day': '/data/pipeline',
    'etl-success': '/data/pipeline',
    'activity-events': '/analytics/business',
};

export default function DashboardPage() {
    const [range, setRange] = useState<DateRange>('30d');

    const rangeLabel: Record<DateRange, string> = {
        all: 'historique complet',
        '7d': '7 derniers jours',
        '30d': '30 derniers jours',
        '90d': '90 derniers jours',
    };

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['dashboard', range],
        queryFn: () => fetchDashboardData(range),
        refetchInterval: 30_000,
    });

    if (isLoading) return <LoadingState />;
    if (isError) return <ErrorState message={getErrorMessage(error, 'Erreur lors du chargement du dashboard.')} />;
    if (!data) return null;

    const {
        kpis, userActivity, dataQualityTrend,
        dataSources, anomaliesByType,
        dataIngestion, anomalyTrend,
    } = data;

    /** KPI export columns */
    const kpiExportColumns: ExportColumn[] = [
        { field: 'label', headerName: 'Indicateur' },
        { field: 'value', headerName: 'Valeur' },
        { field: 'unit', headerName: 'Unité' },
        { field: 'trend', headerName: 'Tendance (%)' },
        { field: 'status', headerName: 'Statut' },
    ];

    return (
        <Box>
            {/* Page title — uses shared PageHeader for consistency */}
            <PageHeader
                title="Dashboard"
                subtitle="Vue d'ensemble des indicateurs clés et de la qualité des flux de données."
                actions={
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <DateRangeSelector value={range} onChange={setRange} />
                        <ExportButton
                            fileName="dashboard-kpis"
                            title="Dashboard — Indicateurs Clés"
                            columns={kpiExportColumns}
                            rows={kpis as unknown as Record<string, unknown>[]}
                        />
                    </Box>
                }
            />

            {/* KPI Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {kpis.map((kpi) => (
                    <Grid key={kpi.id} size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                        <KPICard
                            label={kpi.label}
                            value={kpi.value}
                            unit={kpi.unit}
                            trend={kpi.trend}
                            status={kpi.status}
                            to={KPI_DRILLDOWN_ROUTES[kpi.id]}
                        />
                    </Grid>
                ))}
            </Grid>

            {/* Section: Tendances */}
            <Typography variant="h5" sx={{ mb: 2 }}>
                Tendances
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <ActivityLineChart
                        data={userActivity}
                        title="Utilisateurs actifs"
                        subtitle={`Évolution sur ${rangeLabel[range]}`}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <ActivityLineChart
                        data={dataQualityTrend}
                        title="Score qualité données"
                        subtitle={`Progression sur ${rangeLabel[range]}`}
                        color="#16A34A"
                    />
                </Grid>
            </Grid>

            {/* Section: Volume d'ingestion */}
            <Typography variant="h5" sx={{ mb: 2 }}>
                Volume d'ingestion
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12 }}>
                    <DataIngestionAreaChart
                        data={dataIngestion}
                        title="Enregistrements ingérés par source"
                        subtitle={`Stacked area — ${rangeLabel[range]}`}
                    />
                </Grid>
            </Grid>

            {/* Section: Répartition & Anomalies */}
            <Typography variant="h5" sx={{ mb: 2 }}>
                Répartition & Anomalies
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <SourcesPieChart
                        data={dataSources}
                        title="Sources de données"
                        subtitle="Répartition par domaine de santé"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <AnomaliesBarChart
                        data={anomaliesByType}
                        title="Anomalies par type"
                        subtitle={`Volume observé sur ${rangeLabel[range]}`}
                    />
                </Grid>
            </Grid>

            {/* Section: Suivi des anomalies */}
            <Typography variant="h5" sx={{ mb: 2 }}>
                Suivi des anomalies
            </Typography>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                    <AnomalyTrendChart
                        data={anomalyTrend}
                        title="Nouvelles vs Résolues"
                        subtitle={`Évolution des détections et résolutions — ${rangeLabel[range]}`}
                    />
                </Grid>
            </Grid>
        </Box>
    );
}
