import { Card, Typography, Box } from '@mui/material';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import type { CategoryDataPoint } from '@/types';

interface SourcesPieChartProps {
    data: CategoryDataPoint[];
    title: string;
}

export default function SourcesPieChart({ data, title }: SourcesPieChartProps) {
    return (
        <Card sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                {title}
            </Typography>
            <Box sx={{ width: '100%', height: 300 }} role="img" aria-label={title}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={3}
                            label={({ name, percent }) =>
                                `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                            }
                        >
                            {data.map((entry, idx) => (
                                <Cell
                                    key={entry.name}
                                    fill={entry.color ?? `hsl(${idx * 72}, 70%, 55%)`}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(v, name) => [
                                `${v}%`,
                                String(name),
                            ]}
                        />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </Box>
        </Card>
    );
}
