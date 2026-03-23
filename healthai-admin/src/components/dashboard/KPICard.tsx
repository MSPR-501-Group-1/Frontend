import { Card, CardActionArea, Typography, Box, Chip } from '@mui/material';
import { TrendingUp, TrendingDown, Remove } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { KPIStatus } from '@/types';

interface KPICardProps {
    label: string;
    description?: string;
    value: string | number;
    unit?: string;
    comparedValue?: string | number | null;
    comparedUnit?: string;
    trend?: number;
    trendUnit?: '%' | 'pts';
    trendPositiveIsGood?: boolean;
    status?: KPIStatus;
    to?: string;
}

export default function KPICard({
    label,
    description,
    value,
    unit,
    comparedValue,
    comparedUnit,
    trend,
    trendUnit = '%',
    trendPositiveIsGood = true,
    to,
}: KPICardProps) {
    const navigate = useNavigate();

    const hasTrend = typeof trend === 'number' && Number.isFinite(trend);
    const trendValue = hasTrend ? trend : undefined;

    const trendIcon =
        trendValue === undefined ? null
            : trendValue > 0 ? <TrendingUp sx={{ fontSize: 16 }} />
                : trendValue < 0 ? <TrendingDown sx={{ fontSize: 16 }} />
                    : <Remove sx={{ fontSize: 16 }} />;

    const trendColor: 'success' | 'error' | 'default' =
        trendValue === undefined || trendValue === 0
            ? 'default'
            : ((trendPositiveIsGood && trendValue > 0) || (!trendPositiveIsGood && trendValue < 0))
                ? 'success'
                : 'error';

    const borderColor = trendColor === 'success'
        ? 'success.main'
        : trendColor === 'error'
            ? 'error.main'
            : 'divider';

    const hasCompared = comparedValue !== undefined && comparedValue !== null;
    const comparedText = hasCompared
        ? `${typeof comparedValue === 'number' ? comparedValue.toLocaleString('fr-FR') : comparedValue}${comparedUnit ? ` ${comparedUnit}` : ''}`
        : null;

    const cardContent = (
        <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {label}
            </Typography>
            {description && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.25 }}>
                    {description}
                </Typography>
            )}
            {comparedText && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.25 }}>
                    Compare a la periode precedente: {comparedText}
                </Typography>
            )}

            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                <Typography variant="h4" fontWeight={700}>
                    {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
                </Typography>
                {unit && (
                    <Typography variant="body1" color="text.secondary">
                        {unit}
                    </Typography>
                )}
            </Box>

            {trendValue !== undefined && (
                <Box sx={{ mt: 1 }}>
                    <Chip
                        icon={trendIcon ?? undefined}
                        label={`${trendValue > 0 ? '+' : ''}${trendValue}${trendUnit}`}
                        color={trendColor}
                        size="small"
                        variant="filled"
                        sx={{ fontWeight: 700 }}
                    />
                </Box>
            )}
        </>
    );

    const cardSx = {
        height: '100%',
        display: 'flex',
        flexDirection: 'column' as const,
        justifyContent: 'space-between',
        borderLeft: 4,
        borderColor,
    };

    if (to) {
        return (
            <Card sx={cardSx}>
                <CardActionArea
                    onClick={() => navigate(to)}
                    sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between' }}
                >
                    {cardContent}
                </CardActionArea>
            </Card>
        );
    }

    return (
        <Card sx={{ ...cardSx, p: 2.5 }}>
            {cardContent}
        </Card>
    );
}
