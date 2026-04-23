import { Card, Typography, Box } from '@mui/material';
import { useId } from 'react';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
    TOOLTIP_STYLE, ANIMATION_DURATION, LABEL_LINE_STYLE,
    LEGEND_STYLE, LEGEND_ICON_SIZE, LEGEND_ICON_TYPE,
} from '@/lib/chart.constants';
import type { CategoryDataPoint } from '@/types';
import ChartDataTable from './ChartDataTable';

const ACCESSIBLE_PIE_COLORS = ['#1D4ED8', '#B91C1C', '#166534', '#6D28D9', '#0F766E', '#9A3412'];

interface SourcesPieChartProps {
    data: CategoryDataPoint[];
    title: string;
    subtitle?: string;
}

export default function SourcesPieChart({ data, title, subtitle }: SourcesPieChartProps) {
    const chartId = useId();
    const titleId = `${chartId}-title`;
    const total = data.reduce((s, d) => s + d.value, 0);

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

            <Box sx={{ width: '100%', height: 320, position: 'relative' }} aria-hidden="true">
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
                            animationDuration={ANIMATION_DURATION}
                            animationBegin={200}
                            label={({ name, percent }) =>
                                `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                            }
                            labelLine={LABEL_LINE_STYLE}
                        >
                            {data.map((entry, idx) => (
                                <Cell
                                    key={entry.name}
                                    fill={entry.color ?? ACCESSIBLE_PIE_COLORS[idx % ACCESSIBLE_PIE_COLORS.length]}
                                    stroke="none"
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={TOOLTIP_STYLE}
                            formatter={(v, name) => [
                                `${v}%`,
                                String(name),
                            ]}
                        />
                        <Legend
                            iconType={LEGEND_ICON_TYPE}
                            iconSize={LEGEND_ICON_SIZE}
                            wrapperStyle={LEGEND_STYLE}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </Box>

            <ChartDataTable<CategoryDataPoint>
                title={title}
                rowHeaderKey="name"
                columns={[
                    { key: 'name', label: 'Source' },
                    { key: 'value', label: 'Part (%)', format: (value) => `${Number(value ?? 0)}%` },
                ]}
                rows={data}
                summaryLabel={`Afficher les données tabulaires de ${title}`}
            />
        </Card>
    );
}
