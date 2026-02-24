import { Card, Typography, Box } from '@mui/material';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import type { CategoryDataPoint } from '@/types';

interface AnomaliesBarChartProps {
    data: CategoryDataPoint[];
    title: string;
}

export default function AnomaliesBarChart({ data, title }: AnomaliesBarChartProps) {
    return (
        <Card sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                {title}
            </Typography>
            <Box sx={{ width: '100%', height: 300 }} role="img" aria-label={title}>
                <ResponsiveContainer>
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ top: 5, right: 20, bottom: 5, left: 100 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis type="number" tick={{ fontSize: 12 }} />
                        <YAxis
                            type="category"
                            dataKey="name"
                            tick={{ fontSize: 12 }}
                            width={95}
                        />
                        <Tooltip
                            formatter={(v) => [`${v} anomalies`, 'Total']}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
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
