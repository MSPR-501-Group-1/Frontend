import { Card, Typography, Box } from '@mui/material';
import {
    ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
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
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 11, fill: '#94A3B8' }}
                            tickFormatter={(d: string) => {
                                const date = new Date(d);
                                return `${date.getDate()}/${date.getMonth() + 1}`;
                            }}
                            axisLine={{ stroke: '#E2E8F0' }}
                        />
                        <YAxis
                            yAxisId="count"
                            tick={{ fontSize: 11, fill: '#94A3B8' }}
                            axisLine={{ stroke: '#E2E8F0' }}
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
                            tick={{ fontSize: 11, fill: '#94A3B8' }}
                            axisLine={{ stroke: '#E2E8F0' }}
                            tickFormatter={(v: number) => `${v}%`}
                            label={{
                                value: 'Taux résolution',
                                angle: 90,
                                position: 'insideRight',
                                style: { fontSize: 11, fill: '#94A3B8' },
                            }}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: 8,
                                border: '1px solid #E2E8F0',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                fontSize: 13,
                            }}
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
                            animationDuration={1000}
                        />
                        <Bar
                            yAxisId="count"
                            dataKey="Résolues"
                            fill="#34D399"
                            radius={[4, 4, 0, 0]}
                            barSize={16}
                            animationDuration={1000}
                        />
                        <Line
                            yAxisId="rate"
                            type="monotone"
                            dataKey="Taux"
                            stroke="#7C3AED"
                            strokeWidth={2.5}
                            dot={{ r: 3, fill: '#7C3AED', strokeWidth: 0 }}
                            activeDot={{ r: 5, fill: '#fff', stroke: '#7C3AED', strokeWidth: 2 }}
                            animationDuration={1400}
                        />
                        <Legend
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontSize: 12 }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </Box>
        </Card>
    );
}
