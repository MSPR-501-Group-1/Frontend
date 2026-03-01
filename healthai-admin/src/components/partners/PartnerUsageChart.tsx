/**
 * PartnerUsageChart — horizontal bar chart showing API calls by partner.
 *
 * Reuses shared chart constants (DRY) and useChartTheme for dark mode.
 * Pattern identical to AnomaliesBarChart — consistent visual language.
 */

import { Card, Typography, Box } from '@mui/material';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';
import {
    AXIS_TICK_STYLE, TOOLTIP_STYLE, ANIMATION_DURATION,
    GRID_STROKE, GRID_DASH,
} from '@/lib/chart.constants';
import { useChartTheme } from '@/hooks/useChartTheme';
import type { CategoryDataPoint } from '@/types';

// ─── Color palette (consistent with project theme) ──────────

const BAR_COLORS = ['#2563EB', '#7C3AED', '#16A34A', '#F59E0B', '#DC2626', '#06B6D4', '#EC4899', '#8B5CF6'];

// ─── Props ──────────────────────────────────────────────────

interface PartnerUsageChartProps {
    data: CategoryDataPoint[];
    title: string;
    subtitle?: string;
}

// ─── Component ──────────────────────────────────────────────

export default function PartnerUsageChart({ data, title, subtitle }: PartnerUsageChartProps) {
    const { gridStroke } = useChartTheme();

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
            <Box sx={{ width: '100%', height: 360 }} role="img" aria-label={title}>
                <ResponsiveContainer>
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid
                            strokeDasharray={GRID_DASH}
                            stroke={gridStroke || GRID_STROKE}
                            horizontal={false}
                        />
                        <XAxis
                            type="number"
                            tick={AXIS_TICK_STYLE}
                            tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`}
                        />
                        <YAxis
                            type="category"
                            dataKey="name"
                            tick={AXIS_TICK_STYLE}
                            width={130}
                        />
                        <Tooltip
                            contentStyle={TOOLTIP_STYLE}
                            formatter={(v) => [`${Number(v).toLocaleString('fr-FR')} appels`, 'API Calls']}
                        />
                        <Bar
                            dataKey="value"
                            animationDuration={ANIMATION_DURATION}
                            radius={[0, 4, 4, 0]}
                        >
                            {data.map((_, idx) => (
                                <Cell key={idx} fill={BAR_COLORS[idx % BAR_COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </Box>
        </Card>
    );
}
