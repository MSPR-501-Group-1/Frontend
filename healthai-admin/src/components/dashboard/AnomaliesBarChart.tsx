import { Card, Typography, Box } from '@mui/material';
import { useId } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell, LabelList,
} from 'recharts';
import { AXIS_TICK_STYLE, AXIS_LINE_STYLE, GRID_STROKE, GRID_DASH, TOOLTIP_STYLE, ANIMATION_DURATION } from '@/lib/chart.constants';
import type { CategoryDataPoint } from '@/types';
import ChartDataTable from './ChartDataTable';

const ACCESSIBLE_BAR_COLORS = ['#1D4ED8', '#B91C1C', '#166534', '#6D28D9', '#0F766E', '#9A3412'];

interface AnomaliesBarChartProps {
    data: CategoryDataPoint[];
    title: string;
    subtitle?: string;
}

export default function AnomaliesBarChart({ data, title, subtitle }: AnomaliesBarChartProps) {
    const chartId = useId();
    const titleId = `${chartId}-title`;
    const total = data.reduce((s, d) => s + d.value, 0);

    return (
        <Card component="section" aria-labelledby={titleId} sx={{ p: 2.5, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 2 }}>
                <Box>
                    <Typography id={titleId} variant="h6" component="h3">
                        {title}
                    </Typography>
                    {subtitle && (
                        <Typography variant="body2" color="text.secondary">
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                <Typography variant="h6" component="p" color="text.secondary" fontWeight={600}>
                    {total} total
                </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Visualisation graphique accompagnée d'un tableau de données accessible ci-dessous.
            </Typography>

            <Box sx={{ width: '100%', height: 300 }} aria-hidden="true">
                <ResponsiveContainer>
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ top: 5, right: 40, bottom: 5, left: 100 }}
                    >
                        <CartesianGrid strokeDasharray={GRID_DASH} stroke={GRID_STROKE} horizontal={false} />
                        <XAxis
                            type="number"
                            tick={AXIS_TICK_STYLE}
                            axisLine={AXIS_LINE_STYLE}
                        />
                        <YAxis
                            type="category"
                            dataKey="name"
                            tick={{ fontSize: 12, fill: '#475569' }}
                            width={95}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={TOOLTIP_STYLE}
                            formatter={(v) => [`${v} anomalies`, 'Total']}
                        />
                        <Bar
                            dataKey="value"
                            radius={[0, 6, 6, 0]}
                            barSize={22}
                            animationDuration={ANIMATION_DURATION}
                        >
                            <LabelList
                                dataKey="value"
                                position="right"
                                style={{ fontSize: 12, fontWeight: 600, fill: '#475569' }}
                            />
                            {data.map((entry, idx) => (
                                <Cell
                                    key={entry.name}
                                    fill={entry.color ?? ACCESSIBLE_BAR_COLORS[idx % ACCESSIBLE_BAR_COLORS.length]}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </Box>

            <ChartDataTable<CategoryDataPoint>
                title={title}
                rowHeaderKey="name"
                columns={[
                    { key: 'name', label: 'Type d\'anomalie' },
                    { key: 'value', label: 'Nombre', format: (value) => String(Number(value ?? 0)) },
                ]}
                rows={data}
                summaryLabel={`Afficher les données tabulaires de ${title}`}
            />
        </Card>
    );
}
