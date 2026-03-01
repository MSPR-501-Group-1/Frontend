import { Box, Grid, Card, Typography } from '@mui/material';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceLine, Legend,
    BarChart, Bar,
    PieChart, Pie, Cell,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { LoadingState, ErrorState, PageHeader } from '@/components/feedback';
import { KPIGrid } from '@/components/shared';
import { fetchBusinessData } from '@/services/business.service';
import {
    AXIS_TICK_STYLE, AXIS_LINE_STYLE, GRID_STROKE, GRID_DASH,
    TOOLTIP_STYLE, ANIMATION_DURATION,
    LEGEND_STYLE, LEGEND_ICON_SIZE, LEGEND_ICON_TYPE,
    REFERENCE_LINE_COLORS,
} from '@/lib/chart.constants';
import { formatShortDate, formatTooltipDate, formatCompact } from '@/lib/formatters';
import type { CategoryDataPoint } from '@/types';

// ─── Page ───────────────────────────────────────────────────

export default function BusinessPage() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['analytics', 'business'],
        queryFn: fetchBusinessData,
    });

    if (isLoading) return <LoadingState />;
    if (isError) return <ErrorState message="Erreur lors du chargement des KPIs business." />;
    if (!data) return null;

    const avgDAU = data.engagementTrend.length > 0
        ? Math.round(data.engagementTrend.reduce((s, p) => s + p.value, 0) / data.engagementTrend.length)
        : 0;

    return (
        <Box>
            <PageHeader
                title="KPIs Business"
                subtitle="Indicateurs stratégiques d'engagement, de rétention et de performance"
            />

            <KPIGrid
                items={data.kpis}
                columns={{ xs: 12, sm: 6, md: 4, lg: 2 }}
            />

            {/* Engagement trend (LineChart) */}
            <Card sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Utilisateurs actifs / jour (30 derniers jours)
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
                            y={4000}
                            stroke={REFERENCE_LINE_COLORS.target}
                            strokeDasharray="6 4"
                            label={{ value: 'Objectif', fill: REFERENCE_LINE_COLORS.target, fontSize: 11 }}
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

            {/* Bottom row: Retention cohorts + Feature adoption + Revenue vs Target */}
            <Grid container spacing={3}>
                {/* Retention cohorts (BarChart) */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            Rétention par cohorte
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
                                    formatter={(value?: number) => [`${value ?? 0}%`, 'Rétention']}
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

                {/* Feature adoption (PieChart) */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            Adoption des fonctionnalités
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
                                    formatter={(value?: number) => [`${value ?? 0}%`, 'Adoption']}
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

                {/* Revenue vs Target (grouped BarChart) */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            Revenus vs Objectif
                        </Typography>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={data.revenueVsTarget}>
                                <CartesianGrid stroke={GRID_STROKE} strokeDasharray={GRID_DASH} />
                                <XAxis
                                    dataKey="date"
                                    tick={AXIS_TICK_STYLE}
                                    axisLine={AXIS_LINE_STYLE}
                                />
                                <YAxis
                                    tick={AXIS_TICK_STYLE}
                                    axisLine={AXIS_LINE_STYLE}
                                    tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`}
                                />
                                <Tooltip
                                    contentStyle={TOOLTIP_STYLE}
                                    formatter={(value?: number) => [`${(value ?? 0).toLocaleString('fr-FR')} €`, '']}
                                />
                                <Legend
                                    wrapperStyle={LEGEND_STYLE}
                                    iconSize={LEGEND_ICON_SIZE}
                                    iconType={LEGEND_ICON_TYPE}
                                />
                                <Bar
                                    dataKey="actual"
                                    name="Réalisé"
                                    fill="#2563EB"
                                    radius={[4, 4, 0, 0]}
                                    animationDuration={ANIMATION_DURATION}
                                />
                                <Bar
                                    dataKey="target"
                                    name="Objectif"
                                    fill="#E2E8F0"
                                    radius={[4, 4, 0, 0]}
                                    animationDuration={ANIMATION_DURATION}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
