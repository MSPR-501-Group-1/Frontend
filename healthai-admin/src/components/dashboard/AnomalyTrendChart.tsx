import { Card, Typography, Box } from '@mui/material';
import { useId } from 'react';
import {
    ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
    AXIS_TICK_STYLE, AXIS_LINE_STYLE, GRID_STROKE, GRID_DASH,
    TOOLTIP_STYLE, ANIMATION_DURATION, ANIMATION_DURATION_SLOW,
    LEGEND_STYLE, LEGEND_ICON_SIZE, LEGEND_ICON_TYPE,
} from '@/lib/chart.constants';
import { formatShortDate, formatTooltipDate } from '@/lib/formatters';
import type { MultiSeriesPoint } from '@/types';
import ChartDataTable from './ChartDataTable';

interface AnomalyTrendChartProps {
    data: MultiSeriesPoint[];
    title: string;
    subtitle?: string;
}

export default function AnomalyTrendChart({ data, title, subtitle }: AnomalyTrendChartProps) {
    const chartId = useId();
    const titleId = `${chartId}-title`;

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
                                style: { fontSize: 11, fill: '#334155' },
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
                                style: { fontSize: 11, fill: '#334155' },
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
                            fill="#B91C1C"
                            radius={[4, 4, 0, 0]}
                            barSize={16}
                            animationDuration={ANIMATION_DURATION}
                        />
                        <Bar
                            yAxisId="count"
                            dataKey="Résolues"
                            fill="#166534"
                            radius={[4, 4, 0, 0]}
                            barSize={16}
                            animationDuration={ANIMATION_DURATION}
                        />
                        <Line
                            yAxisId="rate"
                            type="monotone"
                            dataKey="Taux"
                            stroke="#6D28D9"
                            strokeWidth={2.5}
                            dot={{ r: 3, fill: '#6D28D9', strokeWidth: 0 }}
                            activeDot={{ r: 5, fill: '#fff', stroke: '#6D28D9', strokeWidth: 2 }}
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

            <ChartDataTable<MultiSeriesPoint>
                title={title}
                rowHeaderKey="date"
                columns={[
                    { key: 'date', label: 'Date', format: (value) => formatTooltipDate(value) },
                    { key: 'Nouvelles', label: 'Nouvelles', format: (value) => String(Number(value ?? 0)) },
                    { key: 'Résolues', label: 'Résolues', format: (value) => String(Number(value ?? 0)) },
                    {
                        key: 'Taux',
                        label: 'Taux de résolution',
                        format: (value) => `${Number(value ?? 0)}%`,
                    },
                ]}
                rows={data}
                summaryLabel={`Afficher les données tabulaires de ${title}`}
            />
        </Card>
    );
}
