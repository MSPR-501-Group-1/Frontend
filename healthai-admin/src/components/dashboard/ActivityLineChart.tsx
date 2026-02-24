import { Card, Typography, Box } from '@mui/material';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import type { TimeSeriesPoint } from '@/types';

interface ActivityLineChartProps {
    data: TimeSeriesPoint[];
    title: string;
    color?: string;
    showTarget?: boolean;
}

export default function ActivityLineChart({
    data,
    title,
    color = '#2563EB',
    showTarget = true,
}: ActivityLineChartProps) {
    // Find a representative target (use first point's target)
    const targetValue = showTarget ? data[0]?.target : undefined;

    return (
        <Card sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                {title}
            </Typography>
            <Box sx={{ width: '100%', height: 300 }} role="img" aria-label={title}>
                <ResponsiveContainer>
                    <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12 }}
                            tickFormatter={(d: string) => {
                                const date = new Date(d);
                                return `${date.getDate()}/${date.getMonth() + 1}`;
                            }}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                            labelFormatter={(d) =>
                                new Date(String(d)).toLocaleDateString('fr-FR', {
                                    day: 'numeric', month: 'short',
                                })
                            }
                            formatter={(v) => [Number(v).toLocaleString('fr-FR'), 'Valeur']}
                        />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4 }}
                        />
                        {targetValue !== undefined && (
                            <ReferenceLine
                                y={targetValue}
                                stroke="#DC2626"
                                strokeDasharray="6 4"
                                label={{ value: 'Objectif', fill: '#DC2626', fontSize: 12 }}
                            />
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </Box>
        </Card>
    );
}
