/**
 * PartnerTypePieChart — donut chart showing partner type distribution.
 *
 * Pattern identical to SourcesPieChart (DRY: same visual conventions).
 * Reuses shared chart constants and useChartTheme for dark mode.
 */

import { Card, Typography, Box } from '@mui/material';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
    TOOLTIP_STYLE, ANIMATION_DURATION, LABEL_LINE_STYLE,
    LEGEND_STYLE, LEGEND_ICON_SIZE, LEGEND_ICON_TYPE,
} from '@/lib/chart.constants';
import type { CategoryDataPoint } from '@/types';

// ─── Props ──────────────────────────────────────────────────

interface PartnerTypePieChartProps {
    data: CategoryDataPoint[];
    title: string;
    subtitle?: string;
}

// ─── Component ──────────────────────────────────────────────

export default function PartnerTypePieChart({ data, title, subtitle }: PartnerTypePieChartProps) {
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
                        {total}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Partenaires
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
                                    fill={entry.color ?? `hsl(${idx * 90}, 70%, 55%)`}
                                    stroke="none"
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={TOOLTIP_STYLE}
                            formatter={(v, name) => [
                                `${v} partenaire${Number(v) > 1 ? 's' : ''}`,
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
        </Card>
    );
}
