import { Card, Typography, Box, Alert } from '@mui/material';
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

const SERIES = [
    { key: 'Nutrition', color: '#2563EB' },
    { key: 'Fitness', color: '#7C3AED' },
    { key: 'Biométrique', color: '#16A34A' },
    { key: 'Sommeil', color: '#F59E0B' },
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
    const availableSeries = SERIES.filter((series) =>
        data.some((point) => typeof point[series.key] === 'number')
    );
    const unavailableSeries = SERIES.filter((series) =>
        !availableSeries.some((available) => available.key === series.key)
    );
    const hasRenderableData = data.length > 0 && availableSeries.length > 0;

    return (
        <Card sx={{ p: 2.5, height: '100%' }}>
            <Box sx={{ mb: 2 }}>
                <Typography variant="h6">{title}</Typography>
                {subtitle && (
                    <Typography variant="body2" color="text.secondary">
                        {subtitle}
                    </Typography>
                )}
            </Box>
            <Box sx={{ width: '100%', height: 320 }} role="img" aria-label={title}>
                {!hasRenderableData ? (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        Non disponible: aucune serie d'ingestion calculable depuis les donnees SQL.
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
            {unavailableSeries.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    Series non disponibles (aucune source DB fiable): {unavailableSeries.map((series) => series.key).join(', ')}.
                </Typography>
            )}
        </Card>
    );
}
