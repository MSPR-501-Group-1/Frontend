import { Card, Typography, Box } from '@mui/material';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
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
                    <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <defs>
                            {SERIES.map((s) => (
                                <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={s.color} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={s.color} stopOpacity={0.02} />
                                </linearGradient>
                            ))}
                        </defs>
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
                            tick={{ fontSize: 11, fill: '#94A3B8' }}
                            axisLine={{ stroke: '#E2E8F0' }}
                            tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: 8,
                                border: '1px solid #E2E8F0',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                fontSize: 13,
                            }}
                            labelFormatter={(d) =>
                                new Date(String(d)).toLocaleDateString('fr-FR', {
                                    weekday: 'short', day: 'numeric', month: 'short',
                                })
                            }
                            formatter={(v) => [Number(v).toLocaleString('fr-FR'), undefined]}
                        />
                        {SERIES.map((s) => (
                            <Area
                                key={s.key}
                                type="monotone"
                                dataKey={s.key}
                                stackId="ingestion"
                                stroke={s.color}
                                strokeWidth={1.5}
                                fill={`url(#grad-${s.key})`}
                                animationDuration={1200}
                            />
                        ))}
                        <Legend
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontSize: 12 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </Box>
        </Card>
    );
}
