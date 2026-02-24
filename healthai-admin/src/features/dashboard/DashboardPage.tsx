import { Typography, Box, Grid } from '@mui/material';
import KPICard from '@/components/dashboard/KPICard';
import ActivityLineChart from '@/components/dashboard/ActivityLineChart';
import SourcesPieChart from '@/components/dashboard/SourcesPieChart';
import AnomaliesBarChart from '@/components/dashboard/AnomaliesBarChart';
import { dashboardData } from '@/mocks/data';

export default function DashboardPage() {
    const { kpis, userActivity, dataQualityTrend, dataSources, anomaliesByType } = dashboardData;

    return (
        <Box>
            {/* Page title */}
            <Typography variant="h4" sx={{ mb: 1 }}>
                Dashboard
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
                Vue d'ensemble des indicateurs clés — HealthAI Coach
            </Typography>

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

            {/* Charts row 1: Line charts */}
            <Typography variant="h5" sx={{ mb: 2 }}>
                Tendances
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <ActivityLineChart
                        data={userActivity}
                        title="Utilisateurs actifs — 30 derniers jours"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <ActivityLineChart
                        data={dataQualityTrend}
                        title="Score qualité des données — 30 jours"
                        color="#16A34A"
                    />
                </Grid>
            </Grid>

            {/* Charts row 2: Pie + Bar */}
            <Typography variant="h5" sx={{ mb: 2 }}>
                Répartition
            </Typography>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <SourcesPieChart
                        data={dataSources}
                        title="Sources de données"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <AnomaliesBarChart
                        data={anomaliesByType}
                        title="Anomalies par type"
                    />
                </Grid>
            </Grid>
        </Box>
    );
}
