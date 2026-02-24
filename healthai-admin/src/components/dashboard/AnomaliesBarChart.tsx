import { Card, Typography, Box } from '@mui/material';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell, LabelList,
} from 'recharts';
import { AXIS_TICK_STYLE, AXIS_LINE_STYLE, GRID_STROKE, GRID_DASH, TOOLTIP_STYLE, ANIMATION_DURATION } from '@/lib/chart.constants';
import type { CategoryDataPoint } from '@/types';

interface AnomaliesBarChartProps {
    data: CategoryDataPoint[];
    title: string;
    subtitle?: string;
}

export default function AnomaliesBarChart({ data, title, subtitle }: AnomaliesBarChartProps) {
    const total = data.reduce((s, d) => s + d.value, 0);

    return (
        <Card sx={{ p: 2.5, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 2 }}>
                <Box>
                    <Typography variant="h6">{title}</Typography>
                    {subtitle && (
                        <Typography variant="body2" color="text.secondary">
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                <Typography variant="h6" color="text.secondary" fontWeight={600}>
                    {total} total
                </Typography>
            </Box>
            <Box sx={{ width: '100%', height: 300 }} role="img" aria-label={title}>
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
                                    fill={entry.color ?? `hsl(${idx * 72}, 70%, 55%)`}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </Box>
        </Card>
    );
}
