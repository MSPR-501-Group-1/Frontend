import { Card, Typography, Box, Alert } from '@mui/material';
import { useId } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
    AXIS_TICK_STYLE, AXIS_LINE_STYLE, GRID_STROKE, GRID_DASH,
    TOOLTIP_STYLE, ANIMATION_DURATION, LEGEND_STYLE, LEGEND_ICON_SIZE, LEGEND_ICON_TYPE,
} from '@/lib/chart.constants';
import { formatShortDate, formatTooltipDate, formatNumber, formatCompact } from '@/lib/formatters';
import type { MultiSeriesPoint } from '@/types';
import ChartDataTable from './ChartDataTable';

const SERIES = [
    { key: 'Nutrition', color: '#2563EB' },
    { key: 'Fitness', color: '#6D28D9' },
    { key: 'Biométrique', color: '#166534' },
    { key: 'Sommeil', color: '#B45309' },
];

interface DataIngestionAreaChartProps {
    data: MultiSeriesPoint[];
    title: string;
    subtitle?: string;
}

export default function DataIngestionAreaChart({
    data,
    title,
    subtitle,
}: DataIngestionAreaChartProps) {
    const chartId = useId();
    const titleId = `${chartId}-title`;

    const availableSeries = SERIES.filter((series) =>
        data.some((point) => typeof point[series.key] === 'number')
    );
    const unavailableSeries = SERIES.filter((series) =>
        !availableSeries.some((available) => available.key === series.key)
    );
    const hasRenderableData = data.length > 0 && availableSeries.length > 0;

    const tableColumns = [
        { key: 'date', label: 'Date', format: (value: unknown) => formatTooltipDate(value) },
        ...availableSeries.map((series) => ({
            key: series.key,
            label: series.key,
            format: (value: unknown) => (typeof value === 'number' ? formatNumber(value) : '-'),
        })),
    ];

    return (
        <Card component="section" aria-labelledby={titleId} sx={{ p: 2.5, height: '100%' }}>
            <Box sx={{ mb: 2 }}>
                <Typography id={titleId} variant="h6" component="h3">
                    {title}
                </Typography>
                {subtitle && (
                    <Typography variant="body2" color="text.secondary">
                        {subtitle}
                    </Typography>
                )}
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Visualisation graphique accompagnée d'un tableau de données accessible ci-dessous.
            </Typography>

            <Box sx={{ width: '100%', height: 320 }} aria-hidden="true">
                {!hasRenderableData ? (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        Non disponible: aucune série d'ingestion calculable depuis les données SQL.
                    </Alert>
                ) : (
                    <ResponsiveContainer>
                        <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <defs>
                                {availableSeries.map((s) => (
                                    <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={s.color} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={s.color} stopOpacity={0.02} />
                                    </linearGradient>
                                ))}
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
                                tickFormatter={(v: number) => formatCompact(v)}
                            />
                            <Tooltip
                                contentStyle={TOOLTIP_STYLE}
                                labelFormatter={formatTooltipDate}
                                formatter={(v) => [formatNumber(Number(v)), undefined]}
                            />
                            {availableSeries.map((s) => (
                                <Area
                                    key={s.key}
                                    type="monotone"
                                    dataKey={s.key}
                                    stackId="ingestion"
                                    stroke={s.color}
                                    strokeWidth={1.5}
                                    fill={`url(#grad-${s.key})`}
                                    animationDuration={ANIMATION_DURATION}
                                />
                            ))}
                            <Legend
                                iconType={LEGEND_ICON_TYPE}
                                iconSize={LEGEND_ICON_SIZE}
                                wrapperStyle={LEGEND_STYLE}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </Box>

            <ChartDataTable<MultiSeriesPoint>
                title={title}
                rowHeaderKey="date"
                columns={tableColumns}
                rows={data}
                summaryLabel={`Afficher les données tabulaires de ${title}`}
            />

            {unavailableSeries.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    Séries non disponibles (aucune source DB fiable): {unavailableSeries.map((series) => series.key).join(', ')}.
                </Typography>
            )}
        </Card>
    );
}
