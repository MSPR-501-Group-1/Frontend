import { useMemo } from 'react';
import { Box, Typography, CircularProgress, Alert, Paper, LinearProgress, Chip } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';
import { fetchDataQualityScore } from '@/services/data-quality.service';
import type { KPIStatus } from '@/types';

// ─── Score Gauge (circular) ────────────────────────────────

const STATUS_COLOR: Record<KPIStatus, string> = {
    success: '#16A34A',
    warning: '#F59E0B',
    error: '#DC2626',
};

function scoreToStatus(score: number): KPIStatus {
    if (score >= 90) return 'success';
    if (score >= 75) return 'warning';
    return 'error';
}

function ScoreGauge({ score }: { score: number }) {
    const status = scoreToStatus(score);
    const color = STATUS_COLOR[status];

    return (
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            {/* Background track */}
            <CircularProgress
                variant="determinate"
                value={100}
                size={160}
                thickness={6}
                sx={{ color: 'grey.200' }}
            />
            {/* Foreground arc */}
            <CircularProgress
                variant="determinate"
                value={score}
                size={160}
                thickness={6}
                sx={{
                    color,
                    position: 'absolute',
                    left: 0,
                    '& .MuiCircularProgress-circle': {
                        strokeLinecap: 'round',
                    },
                }}
            />
            {/* Center label */}
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Typography variant="h3" fontWeight={800} sx={{ color }}>
                    {score}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    / 100
                </Typography>
            </Box>
        </Box>
    );
}

// ─── Dimension card ─────────────────────────────────────────

interface DimensionCardProps {
    label: string;
    score: number;
    description: string;
    status: KPIStatus;
}

function DimensionCard({ label, score, description, status }: DimensionCardProps) {
    const color = STATUS_COLOR[status];

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.5,
                borderLeft: 4,
                borderColor: color,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight={600}>
                    {label}
                </Typography>
                <Chip
                    label={`${score}%`}
                    size="small"
                    sx={{ fontWeight: 700, bgcolor: `${color}18`, color }}
                />
            </Box>
            <LinearProgress
                variant="determinate"
                value={score}
                sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'grey.100',
                    '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        bgcolor: color,
                    },
                }}
            />
            <Typography variant="body2" color="text.secondary">
                {description}
            </Typography>
        </Paper>
    );
}

// ─── History chart ──────────────────────────────────────────

function HistoryChart({ data }: { data: { date: string; value: number; target?: number }[] }) {
    const chartData = useMemo(
        () =>
            data.map((d) => ({
                ...d,
                label: d.date.slice(5), // MM-DD
            })),
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 12 }} tickLine={false} />
                <Tooltip
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
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

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (isError || !data) {
        return (
            <Alert severity="error" sx={{ m: 2 }}>
                Erreur lors du chargement des données de qualité.
            </Alert>
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Qualité des données
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
                Indice de qualité global (DQI) et scores par dimension
            </Typography>

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
                        label={data.overall >= 90 ? 'Excellent' : data.overall >= 75 ? 'Acceptable' : 'Critique'}
                        size="small"
                        color={data.overall >= 90 ? 'success' : data.overall >= 75 ? 'warning' : 'error'}
                        sx={{ fontWeight: 600 }}
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
            <Typography variant="h6" gutterBottom>
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
