import { useMemo, useState } from 'react';
import { Box, Typography, Card, Chip, Grid } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { fetchDataQualityScore } from '@/services/data-quality.service';
import type { DataQualityScore, DateRange, QualityDimension } from '@/types';
import { LoadingState, ErrorState, PageHeader } from '@/components/feedback';
import DateRangeSelector from '@/components/analytics/DateRangeSelector';
import KPICard from '@/components/dashboard/KPICard';
import ScoreGauge from '@/components/data-quality/ScoreGauge';
import DimensionCard from '@/components/data-quality/DimensionCard';
import { TOOLTIP_STYLE, GRID_DASH } from '@/lib/chart.constants';
import { getErrorMessage } from '@/lib/error.utils';
import { scoreToLabel, scoreToStatus, STATUS_MUI_COLOR } from '@/lib/status.utils';
import { formatShortDate, formatTooltipDate } from '@/lib/formatters';

// ─── History chart (co-located — only used here) ────────────

function round1(value: number) {
    return Math.round(value * 10) / 10;
}

function HistoryChart({ data }: { data: { date: string; value: number; target?: number }[] }) {
    const chartData = useMemo(() => data, [data]);
    const average = useMemo(() => {
        if (chartData.length === 0) return 0;
        const total = chartData.reduce((sum, point) => sum + point.value, 0);
        return round1(total / chartData.length);
    }, [chartData]);

    if (chartData.length === 0) {
        return (
            <Box sx={{ py: 5, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    Aucun contrôle de qualité disponible sur la période sélectionnée.
                </Typography>
            </Box>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="qualityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563EB" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray={GRID_DASH} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} tickFormatter={formatShortDate} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} tickLine={false} />
                <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    labelFormatter={formatTooltipDate}
                    formatter={(v) => [`${round1(Number(v))}%`, 'Score']}
                />
                <ReferenceLine y={90} strokeDasharray="6 4" stroke="#16A34A" label={{ value: 'Objectif 90%', fontSize: 11, fill: '#16A34A' }} />
                <ReferenceLine y={average} strokeDasharray="3 3" stroke="#F59E0B" label={{ value: `Moy. ${average}%`, fontSize: 11, fill: '#F59E0B' }} />
                <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#2563EB"
                    strokeWidth={2}
                    fill="url(#qualityGradient)"
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}

// ─── Page ───────────────────────────────────────────────────

export default function DataQualityPage() {
    const [range, setRange] = useState<DateRange>('30d');

    const rangeLabel: Record<DateRange, string> = {
        '7d': '7 derniers jours',
        '30d': '30 derniers jours',
        '90d': '90 derniers jours',
        all: 'historique complet',
    };

    const { data, isLoading, isError, error } = useQuery<DataQualityScore>({
        queryKey: ['data-quality', 'score', range],
        queryFn: () => fetchDataQualityScore(range),
    });

    if (isLoading) return <LoadingState />;
    if (isError || !data) {
        return <ErrorState message={getErrorMessage(error, 'Erreur lors du chargement des données de qualité.')} />;
    }

    const latestHistory = data.history[data.history.length - 1]?.value ?? data.overall;
    const firstHistory = data.history[0]?.value ?? data.overall;
    const historyTrend = data.history.length >= 2 ? round1(latestHistory - firstHistory) : undefined;
    const averageHistory = data.history.length
        ? round1(data.history.reduce((sum, point) => sum + point.value, 0) / data.history.length)
        : data.overall;

    const bestDimension: QualityDimension | null = data.dimensions.length > 0
        ? data.dimensions.reduce((best, current) => (current.score > best.score ? current : best), data.dimensions[0])
        : null;

    const weakestDimension: QualityDimension | null = data.dimensions.length > 0
        ? data.dimensions.reduce((worst, current) => (current.score < worst.score ? current : worst), data.dimensions[0])
        : null;

    const dimensionsAtTarget = data.dimensions.filter((dimension) => dimension.score >= 90).length;

    return (
        <Box>
            <PageHeader
                title="Qualité des données"
                subtitle="Indice de qualité global (DQI), dimensions et évolution temporelle"
                actions={<DateRangeSelector value={range} onChange={setRange} />}
            />

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <KPICard
                        label="Score global DQI"
                        description={`Mesure consolidée sur ${rangeLabel[range]}.`}
                        value={data.overall}
                        unit="%"
                        trend={historyTrend}
                        trendUnit="pts"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <KPICard
                        label="Score moyen période"
                        description="Moyenne journalière des contrôles de qualité."
                        value={averageHistory}
                        unit="%"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <KPICard
                        label="Dimensions à l'objectif"
                        description="Part des dimensions avec un score >= 90%."
                        value={`${dimensionsAtTarget}/${data.dimensions.length}`}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <KPICard
                        label="Dimension la plus faible"
                        description={weakestDimension ? weakestDimension.label : 'Aucune dimension sur cette période'}
                        value={weakestDimension ? weakestDimension.score : 0}
                        unit={weakestDimension ? '%' : undefined}
                    />
                </Grid>
            </Grid>

            {/* Top section : gauge + history */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Gauge */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card
                        sx={{
                            p: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 1.5,
                            height: '100%',
                        }}
                    >
                        <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                            Score global DQI
                        </Typography>
                        <ScoreGauge score={data.overall} />
                        <Chip
                            label={scoreToLabel(data.overall)}
                            size="small"
                            sx={(theme) => {
                                const tone = theme.palette[STATUS_MUI_COLOR[scoreToStatus(data.overall)]].main;
                                return {
                                    fontWeight: 700,
                                    bgcolor: tone,
                                    color: theme.palette.getContrastText(tone),
                                };
                            }}
                        />
                        {bestDimension && (
                            <Typography variant="caption" color="text.secondary">
                                Meilleure dimension: {bestDimension.label} ({bestDimension.score}%)
                            </Typography>
                        )}
                    </Card>
                </Grid>

                {/* History chart */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Card sx={{ p: 3, height: '100%' }}>
                        <Typography variant="subtitle2" color="text.secondary" fontWeight={600} gutterBottom>
                            Évolution du score ({rangeLabel[range]})
                        </Typography>
                        <HistoryChart data={data.history} />
                    </Card>
                </Grid>
            </Grid>

            {/* Dimensions grid */}
            <Typography variant="h6" component="p" gutterBottom>
                Scores par dimension
            </Typography>
            {data.dimensions.length === 0 ? (
                <Card sx={{ p: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                        Aucune dimension calculée pour cette période. Essayez une plage plus large, par exemple "Tout".
                    </Typography>
                </Card>
            ) : (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' },
                        gap: 2,
                    }}
                >
                    {data.dimensions.map((dim) => (
                        <DimensionCard
                            key={dim.id}
                            label={dim.label}
                            score={dim.score}
                            description={dim.description}
                            status={dim.status}
                        />
                    ))}
                </Box>
            )}
        </Box>
    );
}
