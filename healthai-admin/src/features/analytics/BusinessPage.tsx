import { Box, Grid, Card, Typography } from '@mui/material';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceLine, Legend,
    BarChart, Bar,
    PieChart, Pie, Cell,
} from 'recharts';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import KPICard from '@/components/dashboard/KPICard';
import DateRangeSelector from '@/components/analytics/DateRangeSelector';
import { LoadingState, ErrorState, PageHeader } from '@/components/feedback';
import { fetchBusinessData } from '@/services/business.service';
import { getErrorMessage } from '@/lib/error.utils';
import {
    AXIS_TICK_STYLE, AXIS_LINE_STYLE, GRID_STROKE, GRID_DASH,
    TOOLTIP_STYLE, ANIMATION_DURATION,
    LEGEND_STYLE, LEGEND_ICON_SIZE, LEGEND_ICON_TYPE,
    REFERENCE_LINE_COLORS,
} from '@/lib/chart.constants';
import { formatShortDate, formatTooltipDate, formatCompact } from '@/lib/formatters';
import type { CategoryDataPoint, DateRange } from '@/types';

// ─── Page ───────────────────────────────────────────────────

export default function BusinessPage() {
    const [range, setRange] = useState<DateRange>('30d');

    const rangeLabel: Record<DateRange, string> = {
        '7d': '7 derniers jours',
        '30d': '30 derniers jours',
        '90d': '90 derniers jours',
        all: 'historique complet',
    };

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['analytics', 'business', range],
        queryFn: () => fetchBusinessData(range),
    });

    if (isLoading) return <LoadingState />;
    if (isError) return <ErrorState message={getErrorMessage(error, 'Erreur lors du chargement des KPIs business.')} />;
    if (!data) return null;

    const avgDAU = data.engagementTrend.length > 0
        ? Math.round(data.engagementTrend.reduce((s, p) => s + p.value, 0) / data.engagementTrend.length)
        : 0;

    return (
        <Box>
            <PageHeader
                title="KPIs Business"
                subtitle="Indicateurs stratégiques d'engagement, de rétention et de performance"
                actions={<DateRangeSelector value={range} onChange={setRange} />}
            />

            {/* KPI Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {data.kpis.map((kpi) => (
                    <Grid key={kpi.id} size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                        <KPICard
                            label={kpi.label}
                            description={kpi.description}
                            value={kpi.unit ? `${kpi.value}${kpi.unit}` : kpi.value}
                            comparedValue={kpi.comparedValue}
                            comparedUnit={kpi.comparedUnit}
                            trend={kpi.trend}
                            trendUnit={kpi.trendUnit}
                            trendPositiveIsGood={kpi.trendPositiveIsGood}
                            status={kpi.status}
                        />
                    </Grid>
                ))}
            </Grid>

            {/* Engagement trend (LineChart) */}
            <Card sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" component="p" gutterBottom>
                    Utilisateurs actifs / jour ({rangeLabel[range]})
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.engagementTrend}>
                        <defs>
                            <linearGradient id="engagementGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#2563EB" stopOpacity={0.2} />
                                <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid stroke={GRID_STROKE} strokeDasharray={GRID_DASH} />
                        <XAxis
                            dataKey="date"
                            tickFormatter={formatShortDate}
                            tick={AXIS_TICK_STYLE}
                            axisLine={AXIS_LINE_STYLE}
                        />
                        <YAxis
                            tick={AXIS_TICK_STYLE}
                            axisLine={AXIS_LINE_STYLE}
                            tickFormatter={formatCompact}
                        />
                        <Tooltip
                            labelFormatter={formatTooltipDate}
                            contentStyle={TOOLTIP_STYLE}
                        />
                        <ReferenceLine
                            y={avgDAU}
                            stroke={REFERENCE_LINE_COLORS.average}
                            strokeDasharray="3 3"
                            label={{ value: `Moy. ${formatCompact(avgDAU)}`, fill: REFERENCE_LINE_COLORS.average, fontSize: 11 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="value"
                            name="DAU"
                            stroke="#2563EB"
                            strokeWidth={2}
                            dot={false}
                            animationDuration={ANIMATION_DURATION}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Card>

            {/* Bottom row: Role mix + Goal adoption */}
            <Grid container spacing={3}>
                {/* Active users by role (BarChart) */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" component="p" gutterBottom>
                            Répartition des actifs par rôle
                        </Typography>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={data.retentionCohorts} layout="vertical">
                                <CartesianGrid stroke={GRID_STROKE} strokeDasharray={GRID_DASH} horizontal={false} />
                                <XAxis
                                    type="number"
                                    tick={AXIS_TICK_STYLE}
                                    axisLine={AXIS_LINE_STYLE}
                                    domain={[0, 100]}
                                    tickFormatter={(v: number) => `${v}%`}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    tick={AXIS_TICK_STYLE}
                                    axisLine={AXIS_LINE_STYLE}
                                    width={80}
                                />
                                <Tooltip
                                    contentStyle={TOOLTIP_STYLE}
                                    formatter={(value?: number) => [`${value ?? 0}%`, 'Part des actifs']}
                                />
                                <Bar
                                    dataKey="value"
                                    animationDuration={ANIMATION_DURATION}
                                    radius={[0, 4, 4, 0]}
                                >
                                    {data.retentionCohorts.map((entry: CategoryDataPoint, idx: number) => (
                                        <Cell key={idx} fill={entry.color || '#2563EB'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Grid>

                {/* Health goal adoption (PieChart) */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" component="p" gutterBottom>
                            Objectifs santé des actifs
                        </Typography>
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={data.featureAdoption}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={90}
                                    paddingAngle={3}
                                    animationDuration={ANIMATION_DURATION}
                                >
                                    {data.featureAdoption.map((entry: CategoryDataPoint, idx: number) => (
                                        <Cell key={idx} fill={entry.color || '#2563EB'} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={TOOLTIP_STYLE}
                                    formatter={(value?: number) => [`${value ?? 0}%`, 'Part des actifs']}
                                />
                                <Legend
                                    wrapperStyle={LEGEND_STYLE}
                                    iconSize={LEGEND_ICON_SIZE}
                                    iconType={LEGEND_ICON_TYPE}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
