import { Typography, Box, Grid, Card } from '@mui/material';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceLine,
    PieChart, Pie, Cell, Legend,
    BarChart, Bar,
} from 'recharts';
import KPICard from '@/components/dashboard/KPICard';
import { PageHeader } from '@/components/feedback';
import DateRangeSelector from '@/components/analytics/DateRangeSelector';
import { useDateRange } from '@/hooks/useDateRange';
import {
    AXIS_TICK_STYLE, AXIS_LINE_STYLE, GRID_STROKE, GRID_DASH,
    TOOLTIP_STYLE, ANIMATION_DURATION, LABEL_LINE_STYLE, REFERENCE_LINE_COLORS,
    LEGEND_STYLE, LEGEND_ICON_SIZE, LEGEND_ICON_TYPE,
} from '@/lib/chart.constants';
import { formatShortDate, formatTooltipDate, formatWithUnit } from '@/lib/formatters';
import type { AnalyticsPageData, CategoryDataPoint } from '@/types';

interface AnalyticsPageLayoutProps {
    title: string;
    subtitle: string;
    data: AnalyticsPageData;
    /** Main area chart config */
    chartConfig: {
        label: string;
        color: string;
        yAxisUnit?: string;
    };
    /** Labels for the two bottom charts */
    breakdownTitle: string;
    distributionTitle: string;
}

/** Reusable tooltip style alias — now sourced from shared constants. */
const tooltipStyle = TOOLTIP_STYLE;

/**
 * Shared layout template for all Analytics pages (Nutrition / Fitness / Biometric).
 *
 * Structure:
 * - Title + DateRangeSelector
 * - 4 KPI cards
 * - Main AreaChart (time series)
 * - PieChart (breakdown) + BarChart (distribution)
 */
export default function AnalyticsPageLayout({
    title,
    subtitle,
    data,
    chartConfig,
    breakdownTitle,
    distributionTitle,
}: AnalyticsPageLayoutProps) {
    const { range, setRange, filteredData } = useDateRange(data.timeSeries);

    const gradientId = `area-${chartConfig.color.replace('#', '')}`;
    const targetValue = filteredData[0]?.target;
    const avg = filteredData.length > 0
        ? Math.round(filteredData.reduce((s, p) => s + p.value, 0) / filteredData.length * 10) / 10
        : 0;

    return (
        <Box>
            {/* Header — uses shared PageHeader for consistency */}
            <PageHeader
                title={title}
                subtitle={subtitle}
                actions={<DateRangeSelector value={range} onChange={setRange} />}
            />

            {/* KPI Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {data.kpis.map((kpi) => (
                    <Grid key={kpi.id} size={{ xs: 12, sm: 6, md: 3 }}>
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

            {/* Main time series chart */}
            <Card sx={{ p: 2.5, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 2 }}>
                    <Typography variant="h6">{chartConfig.label}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Moyenne : {avg.toLocaleString('fr-FR')}{chartConfig.yAxisUnit ? ` ${chartConfig.yAxisUnit}` : ''}
                    </Typography>
                </Box>
                <Box sx={{ width: '100%', height: 320 }} role="img" aria-label={chartConfig.label}>
                    <ResponsiveContainer>
                        <AreaChart data={filteredData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <defs>
                                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={chartConfig.color} stopOpacity={0.25} />
                                    <stop offset="95%" stopColor={chartConfig.color} stopOpacity={0.02} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray={GRID_DASH} stroke={GRID_STROKE} />
                            <XAxis
                                dataKey="date"
                                tick={AXIS_TICK_STYLE}
                                tickFormatter={formatShortDate}
                                axisLine={AXIS_LINE_STYLE}
                            />
                            <YAxis
                                tick={AXIS_TICK_STYLE}
                                axisLine={AXIS_LINE_STYLE}
                            />
                            <Tooltip
                                contentStyle={tooltipStyle}
                                labelFormatter={formatTooltipDate}
                                formatter={(v) => [
                                    formatWithUnit(Number(v), chartConfig.yAxisUnit),
                                    chartConfig.label,
                                ]}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke={chartConfig.color}
                                strokeWidth={2.5}
                                fill={`url(#${gradientId})`}
                                dot={false}
                                activeDot={{ r: 5, strokeWidth: 2, fill: '#fff', stroke: chartConfig.color }}
                                animationDuration={ANIMATION_DURATION}
                            />
                            {targetValue !== undefined && (
                                <ReferenceLine
                                    y={targetValue}
                                    stroke={REFERENCE_LINE_COLORS.target}
                                    strokeDasharray="6 4"
                                    label={{ value: 'Objectif', fill: REFERENCE_LINE_COLORS.target, fontSize: 11 }}
                                />
                            )}
                            <ReferenceLine
                                y={avg}
                                stroke={REFERENCE_LINE_COLORS.average}
                                strokeDasharray="3 3"
                                label={{ value: `Moy.`, fill: REFERENCE_LINE_COLORS.average, fontSize: 11 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </Box>
            </Card>

            {/* Bottom charts: Pie + Bar */}
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <BreakdownPieChart data={data.breakdown} title={breakdownTitle} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <DistributionBarChart data={data.distribution} title={distributionTitle} />
                </Grid>
            </Grid>
        </Box>
    );
}

// ─── Internal sub-components (co-located, not re-exported) ──

function BreakdownPieChart({ data, title }: { data: CategoryDataPoint[]; title: string }) {
    return (
        <Card sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
            <Box sx={{ width: '100%', height: 300 }} role="img" aria-label={title}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={3}
                            cornerRadius={4}
                            animationDuration={ANIMATION_DURATION}
                            label={({ name, percent }) =>
                                `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                            }
                            labelLine={LABEL_LINE_STYLE}
                        >
                            {data.map((entry, idx) => (
                                <Cell
                                    key={entry.name}
                                    fill={entry.color ?? `hsl(${idx * 72}, 70%, 55%)`}
                                    stroke="none"
                                />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} formatter={(v, name) => [`${v}%`, String(name)]} />
                        <Legend iconType={LEGEND_ICON_TYPE} iconSize={LEGEND_ICON_SIZE} wrapperStyle={LEGEND_STYLE} />
                    </PieChart>
                </ResponsiveContainer>
            </Box>
        </Card>
    );
}

function DistributionBarChart({ data, title }: { data: CategoryDataPoint[]; title: string }) {
    return (
        <Card sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
            <Box sx={{ width: '100%', height: 300 }} role="img" aria-label={title}>
                <ResponsiveContainer>
                    <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray={GRID_DASH} stroke={GRID_STROKE} vertical={false} />
                        <XAxis
                            dataKey="name"
                            tick={AXIS_TICK_STYLE}
                            axisLine={AXIS_LINE_STYLE}
                        />
                        <YAxis
                            tick={AXIS_TICK_STYLE}
                            axisLine={AXIS_LINE_STYLE}
                        />
                        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [Number(v).toLocaleString('fr-FR'), 'Valeur']} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={32} animationDuration={ANIMATION_DURATION}>
                            {data.map((entry, idx) => (
                                <Cell
                                    key={entry.name}
                                    fill={entry.color ?? `hsl(${idx * 60}, 70%, 55%)`}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </Box>
        </Card>
    );
}
