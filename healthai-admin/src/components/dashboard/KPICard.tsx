import { Card, CardActionArea, Typography, Box, Chip } from '@mui/material';
import { TrendingUp, TrendingDown, Remove } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { STATUS_MUI_COLOR } from '@/lib/status.utils';
import type { KPIStatus } from '@/types';

interface KPICardProps {
    label: string;
    value: string | number;
    unit?: string;
    trend?: number;
    status?: KPIStatus;
    to?: string;
}

export default function KPICard({ label, value, unit, trend, status = 'success', to }: KPICardProps) {
    const navigate = useNavigate();

    const trendIcon =
        trend === undefined ? null
            : trend > 0 ? <TrendingUp sx={{ fontSize: 16 }} />
                : trend < 0 ? <TrendingDown sx={{ fontSize: 16 }} />
                    : <Remove sx={{ fontSize: 16 }} />;

    const trendColor: 'success' | 'error' | 'default' =
        trend === undefined ? 'default'
            : trend > 0 ? 'success'
                : trend < 0 ? 'error'
                    : 'default';

    const cardContent = (
        <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {label}
            </Typography>

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

            {trend !== undefined && (
                <Box sx={{ mt: 1 }}>
                    <Chip
                        icon={trendIcon ?? undefined}
                        label={`${trend > 0 ? '+' : ''}${trend}%`}
                        color={trendColor}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
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
        borderColor: `${STATUS_MUI_COLOR[status]}.main`,
    };

    if (to) {
        return (
            <Card sx={cardSx}>
                <CardActionArea
                    onClick={() => navigate(to)}
                    sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between' }}
                    aria-label={`Voir le détail : ${label}`}
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
