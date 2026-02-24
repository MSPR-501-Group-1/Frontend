import { Card, Typography, Box } from '@mui/material';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import type { CategoryDataPoint } from '@/types';

interface SourcesPieChartProps {
    data: CategoryDataPoint[];
    title: string;
    subtitle?: string;
}

export default function SourcesPieChart({ data, title, subtitle }: SourcesPieChartProps) {
    const total = data.reduce((s, d) => s + d.value, 0);

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
            <Box sx={{ width: '100%', height: 320, position: 'relative' }} role="img" aria-label={title}>
                {/* Center label */}
                <Box
                    sx={{
                        position: 'absolute', top: '42%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center', pointerEvents: 'none', zIndex: 1,
                    }}
                >
                    <Typography variant="h5" fontWeight={700}>
                        {total}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Total
                    </Typography>
                </Box>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="45%"
                            innerRadius={65}
                            outerRadius={105}
                            paddingAngle={3}
                            cornerRadius={4}
                            animationDuration={1000}
                            animationBegin={200}
                            label={({ name, percent }) =>
                                `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                            }
                            labelLine={{ stroke: '#94A3B8', strokeWidth: 1 }}
                        >
                            {data.map((entry, idx) => (
                                <Cell
                                    key={entry.name}
                                    fill={entry.color ?? `hsl(${idx * 72}, 70%, 55%)`}
                                    stroke="none"
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                borderRadius: 8,
                                border: '1px solid #E2E8F0',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                fontSize: 13,
                            }}
                            formatter={(v, name) => [
                                `${v}%`,
                                String(name),
                            ]}
                        />
                        <Legend
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontSize: 12 }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </Box>
        </Card>
    );
}
