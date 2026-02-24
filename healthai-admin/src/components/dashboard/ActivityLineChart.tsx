import { Card, Typography, Box } from '@mui/material';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import {
    AXIS_TICK_STYLE, AXIS_LINE_STYLE, GRID_STROKE, GRID_DASH,
    TOOLTIP_STYLE, ANIMATION_DURATION, REFERENCE_LINE_COLORS,
} from '@/lib/chart.constants';
import { formatShortDate, formatTooltipDate, formatNumber } from '@/lib/formatters';
import type { TimeSeriesPoint } from '@/types';

interface ActivityLineChartProps {
    data: TimeSeriesPoint[];
    title: string;
    subtitle?: string;
    color?: string;
    showTarget?: boolean;
}

export default function ActivityLineChart({
    data,
    title,
    subtitle,
    color = '#2563EB',
    showTarget = true,
}: ActivityLineChartProps) {
    const targetValue = showTarget ? data[0]?.target : undefined;
    const gradientId = `gradient-${color.replace('#', '')}`;

    // Compute avg for reference
    const avg = Math.round(data.reduce((s, p) => s + p.value, 0) / data.length);

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
            <Box sx={{ width: '100%', height: 300 }} role="img" aria-label={title}>
                <ResponsiveContainer>
                    <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <defs>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                                <stop offset="95%" stopColor={color} stopOpacity={0.02} />
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
                            contentStyle={TOOLTIP_STYLE}
                            labelFormatter={formatTooltipDate}
                            formatter={(v) => [formatNumber(Number(v)), 'Valeur']}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            strokeWidth={2.5}
                            fill={`url(#${gradientId})`}
                            dot={false}
                            activeDot={{ r: 5, strokeWidth: 2, fill: '#fff', stroke: color }}
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
                            label={{ value: `Moy. ${formatNumber(avg)}`, fill: REFERENCE_LINE_COLORS.average, fontSize: 11 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </Box>
        </Card>
    );
}
