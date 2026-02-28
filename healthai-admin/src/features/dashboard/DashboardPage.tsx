import { Typography, Box, Grid } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import KPICard from '@/components/dashboard/KPICard';
import ActivityLineChart from '@/components/dashboard/ActivityLineChart';
import SourcesPieChart from '@/components/dashboard/SourcesPieChart';
import AnomaliesBarChart from '@/components/dashboard/AnomaliesBarChart';
import DataIngestionAreaChart from '@/components/dashboard/DataIngestionAreaChart';
import AnomalyTrendChart from '@/components/dashboard/AnomalyTrendChart';
import { LoadingState, ErrorState, ExportButton } from '@/components/feedback';
import type { ExportColumn } from '@/lib/export.utils';
import { fetchDashboardData } from '@/services/dashboard.service';

export default function DashboardPage() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['dashboard'],
        queryFn: fetchDashboardData,
        // Polling toutes les 30s — monitoring quasi temps réel
        // sans surcharger le backend (compromis fraîcheur / performance)
        refetchInterval: 30_000,
    });

    if (isLoading) return <LoadingState />;
    if (isError) return <ErrorState message="Erreur lors du chargement du dashboard." />;
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
            {/* Page title */}
            <Typography variant="h4" sx={{ mb: 1 }}>
                Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Typography color="text.secondary" sx={{ flexGrow: 1 }}>
                    Vue d'ensemble des indicateurs clés — HealthAI Coach
                </Typography>
                <ExportButton
                    fileName="dashboard-kpis"
                    title="Dashboard — Indicateurs Clés"
                    columns={kpiExportColumns}
                    rows={kpis as unknown as Record<string, unknown>[]}
                />
            </Box>

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
                        subtitle="Évolution sur les 30 derniers jours"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <ActivityLineChart
                        data={dataQualityTrend}
                        title="Score qualité données"
                        subtitle="Progression vers l'objectif de 90%"
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
                        subtitle="Stacked area — 30 derniers jours"
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
                        subtitle="Anomalies ouvertes actuellement"
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
                        subtitle="Évolution hebdomadaire + taux de résolution — 12 dernières semaines"
                    />
                </Grid>
            </Grid>
        </Box>
    );
}
