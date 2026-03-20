import { useMemo } from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { fetchDataQualityScore } from '@/services/data-quality.service';
import { LoadingState, ErrorState, PageHeader } from '@/components/feedback';
import ScoreGauge from '@/components/data-quality/ScoreGauge';
import DimensionCard from '@/components/data-quality/DimensionCard';
import { TOOLTIP_STYLE, GRID_DASH } from '@/lib/chart.constants';
import { scoreToLabel, scoreToStatus, STATUS_HEX } from '@/lib/status.utils';

// ─── History chart (co-located — only used here) ────────────

function HistoryChart({ data }: { data: { date: string; value: number; target?: number }[] }) {
    const chartData = useMemo(
        () => data.map((d) => ({ ...d, label: d.date.slice(5) })),
        [data],
    );

    return (
        <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="qualityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563EB" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray={GRID_DASH} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 12 }} tickLine={false} />
                <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(v) => [`${Number(v)}%`, 'Score']}
                />
                <ReferenceLine y={90} strokeDasharray="6 4" stroke="#16A34A" label={{ value: 'Objectif 90%', fontSize: 11, fill: '#16A34A' }} />
                <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#2563EB"
                    strokeWidth={2}
                    fill="url(#qualityGradient)"
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}

// ─── Page ───────────────────────────────────────────────────

export default function DataQualityPage() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['data-quality', 'score'],
        queryFn: fetchDataQualityScore,
    });

    if (isLoading) return <LoadingState />;
    if (isError || !data) return <ErrorState message="Erreur lors du chargement des données de qualité." />;

    return (
        <Box>
            <PageHeader title="Qualité des données" subtitle="Indice de qualité global (DQI) et scores par dimension" />

            {/* Top section : gauge + history */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'auto 1fr' },
                    gap: 3,
                    mb: 4,
                }}
            >
                {/* Gauge */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1.5,
                    }}
                >
                    <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                        Score global DQI
                    </Typography>
                    <ScoreGauge score={data.overall} />
                    <Chip
                        label={scoreToLabel(data.overall)}
                        size="small"
                        sx={(theme) => {
                            const tone = STATUS_HEX[scoreToStatus(data.overall)];
                            return {
                                fontWeight: 700,
                                bgcolor: tone,
                                color: theme.palette.getContrastText(tone),
                            };
                        }}
                    />
                </Paper>

                {/* History chart */}
                <Paper elevation={0} sx={{ p: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight={600} gutterBottom>
                        Évolution sur 30 jours
                    </Typography>
                    <HistoryChart data={data.history} />
                </Paper>
            </Box>

            {/* Dimensions grid */}
            <Typography variant="h6" component="p" gutterBottom>
                Scores par dimension
            </Typography>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' },
                    gap: 2,
                }}
            >
                {data.dimensions.map((dim) => (
                    <DimensionCard
                        key={dim.id}
                        label={dim.label}
                        score={dim.score}
                        description={dim.description}
                        status={dim.status}
                    />
                ))}
            </Box>
        </Box>
    );
}
