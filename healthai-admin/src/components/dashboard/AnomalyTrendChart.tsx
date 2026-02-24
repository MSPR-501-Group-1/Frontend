import { Card, Typography, Box } from '@mui/material';
import {
    ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
    AXIS_TICK_STYLE, AXIS_LINE_STYLE, GRID_STROKE, GRID_DASH,
    TOOLTIP_STYLE, ANIMATION_DURATION, ANIMATION_DURATION_SLOW,
    LEGEND_STYLE, LEGEND_ICON_SIZE, LEGEND_ICON_TYPE,
} from '@/lib/chart.constants';
import { formatShortDate } from '@/lib/formatters';
import type { MultiSeriesPoint } from '@/types';

interface AnomalyTrendChartProps {
    data: MultiSeriesPoint[];
    title: string;
    subtitle?: string;
}

export default function AnomalyTrendChart({ data, title, subtitle }: AnomalyTrendChartProps) {
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
                <ResponsiveContainer>
                    <ComposedChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray={GRID_DASH} stroke={GRID_STROKE} />
                        <XAxis
                            dataKey="date"
                            tick={AXIS_TICK_STYLE}
                            tickFormatter={formatShortDate}
                            axisLine={AXIS_LINE_STYLE}
                        />
                        <YAxis
                            yAxisId="count"
                            tick={AXIS_TICK_STYLE}
                            axisLine={AXIS_LINE_STYLE}
                            label={{
                                value: 'Anomalies',
                                angle: -90,
                                position: 'insideLeft',
                                style: { fontSize: 11, fill: '#94A3B8' },
                            }}
                        />
                        <YAxis
                            yAxisId="rate"
                            orientation="right"
                            domain={[0, 150]}
                            tick={AXIS_TICK_STYLE}
                            axisLine={AXIS_LINE_STYLE}
                            tickFormatter={(v: number) => `${v}%`}
                            label={{
                                value: 'Taux résolution',
                                angle: 90,
                                position: 'insideRight',
                                style: { fontSize: 11, fill: '#94A3B8' },
                            }}
                        />
                        <Tooltip
                            contentStyle={TOOLTIP_STYLE}
                            labelFormatter={(d) =>
                                `Semaine du ${new Date(String(d)).toLocaleDateString('fr-FR', {
                                    day: 'numeric', month: 'short',
                                })}`
                            }
                            formatter={(v, name) => {
                                if (String(name) === 'Taux') return [`${v}%`, 'Taux résolution'];
                                return [Number(v), String(name)];
                            }}
                        />
                        <Bar
                            yAxisId="count"
                            dataKey="Nouvelles"
                            fill="#F87171"
                            radius={[4, 4, 0, 0]}
                            barSize={16}
                            animationDuration={ANIMATION_DURATION}
                        />
                        <Bar
                            yAxisId="count"
                            dataKey="Résolues"
                            fill="#34D399"
                            radius={[4, 4, 0, 0]}
                            barSize={16}
                            animationDuration={ANIMATION_DURATION}
                        />
                        <Line
                            yAxisId="rate"
                            type="monotone"
                            dataKey="Taux"
                            stroke="#7C3AED"
                            strokeWidth={2.5}
                            dot={{ r: 3, fill: '#7C3AED', strokeWidth: 0 }}
                            activeDot={{ r: 5, fill: '#fff', stroke: '#7C3AED', strokeWidth: 2 }}
                            animationDuration={ANIMATION_DURATION_SLOW}
                        />
                        <Legend
                            iconType={LEGEND_ICON_TYPE}
                            iconSize={LEGEND_ICON_SIZE}
                            wrapperStyle={LEGEND_STYLE}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </Box>
        </Card>
    );
}
